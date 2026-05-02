import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email'
import { registerNewQuoteApi } from './newquoteApi.js'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: false,
  }),
)
app.use(express.json())

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['supplier', 'engineer', 'office_estimator', 'client', 'admin', null],
      default: null,
    },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    entraLoggedAt: { type: Date, default: null },
    entraInvitationId: { type: String, default: null },
  },
  { timestamps: true },
)

const User = mongoose.model('User', userSchema)

const signToken = (user) => {
  return jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token.' })
  }

  try {
    const token = auth.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ userId: decoded.sub })
    if (!user) {
      return res.status(401).json({ message: 'Invalid auth token.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid auth token.' })
  }
}

/** Constant-time string compare for API keys. */
function secureCompareStrings(a, b) {
  try {
    const ba = Buffer.from(String(a), 'utf8')
    const bb = Buffer.from(String(b), 'utf8')
    if (ba.length !== bb.length) return false
    return crypto.timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

/**
 * If `OPS_API_KEY` is set in `.env`, accept that same value as either:
 *   `X-API-Key: <key>` or `Authorization: Bearer <key>`
 * and treat the request as admin (for private / script access).
 * Otherwise only JWT auth applies (unchanged).
 */
const authMiddlewareOrApiKey = async (req, res, next) => {
  const opsKey = process.env.OPS_API_KEY?.trim()
  if (opsKey) {
    const xKey = typeof req.headers['x-api-key'] === 'string' ? req.headers['x-api-key'].trim() : ''
    const bearer =
      req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : ''
    const candidate = xKey || bearer
    if (candidate && secureCompareStrings(candidate, opsKey)) {
      req.user = {
        userId: 'ops-api-key',
        email: 'ops-api-key@local',
        role: 'admin',
      }
      return next()
    }
  }
  return authMiddleware(req, res, next)
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' })
  }
  next()
}

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000))

const sendOtpEmail = async (toEmail, otp) => {
  const acsConnectionString = process.env.ACS_CONNECTION_STRING?.trim()
  const acsSenderAddress = process.env.ACS_EMAIL_SENDER?.trim()

  if (acsConnectionString && acsSenderAddress) {
    try {
      const client = new EmailClient(acsConnectionString)
      const poller = await client.beginSend({
        senderAddress: acsSenderAddress,
        content: {
          subject: 'Your Optimal verification code',
          plainText: `Your OTP is ${otp}. It expires in 10 minutes.`,
          html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
        },
        recipients: {
          to: [{ address: toEmail }],
        },
      })

      const result = await poller.pollUntilDone()
      if (result.status !== KnownEmailSendStatus.Succeeded) {
        const detail =
          result.error?.code && result.error?.message
            ? `${result.error.code}: ${result.error.message}`
            : result.error?.message || result.status
        if (process.env.NODE_ENV === 'development') {
          console.warn('[sendOtpEmail] ACS operation finished without success:', detail, result)
        }
        return { delivered: false, reason: 'acs_send_rejected', error: detail }
      }
      return { delivered: true, channel: 'azure_communication_email' }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[sendOtpEmail] ACS threw:', error)
      }
      return { delivered: false, reason: 'acs_send_failed', error: String(error) }
    }
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || smtpUser

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return { delivered: false, reason: 'email_not_configured' }
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  await transporter.sendMail({
    from: smtpFrom,
    to: toEmail,
    subject: 'Your Optimal verification code',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
  })

  return { delivered: true, channel: 'smtp' }
}

const getGraphToken = async () => {
  const tenantId = process.env.MS_TENANT_ID
  const clientId = process.env.MS_CLIENT_ID
  const clientSecret = process.env.MS_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    return null
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) return null
  const data = await response.json()
  return data.access_token || null
}

const logEmailInEntra = async (email) => {
  const token = await getGraphToken()
  if (!token) {
    return { ok: false, reason: 'missing_token' }
  }

  const inviteRedirectUrl =
    process.env.ENTRA_INVITE_REDIRECT_URL || 'https://portal.azure.com'

  const response = await fetch('https://graph.microsoft.com/v1.0/invitations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invitedUserEmailAddress: email,
      inviteRedirectUrl,
      sendInvitationMessage: false,
    }),
  })

  if (!response.ok) {
    return { ok: false, reason: 'graph_failed' }
  }

  const data = await response.json()
  return { ok: true, invitationId: data.id || null }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const confirmPassword = String(req.body.confirmPassword || '')

    if (!email.endsWith('@outlook.com')) {
      return res.status(400).json({ message: 'Use a Microsoft Outlook account ending with @outlook.com.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password should be at least 8 characters.' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' })
    }

    const allowedRoles = ['supplier', 'engineer', 'office_estimator', 'client', 'admin']
    const role = String(req.body.role || '').trim()
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Select a valid account role before continuing.' })
    }

    const existing = await User.findOne({ email })
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: 'User already exists. Please log in.' })
    }

    const otp = createOtp()
    const otpHash = await bcrypt.hash(otp, 10)
    const passwordHash = await bcrypt.hash(password, 12)

    const basePayload = {
      userId: existing?.userId || crypto.randomUUID(),
      email,
      passwordHash,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
      role,
    }

    let user = existing
      ? await User.findByIdAndUpdate(existing._id, basePayload, { new: true })
      : await User.create(basePayload)

    const entra = await logEmailInEntra(email)
    if (entra.ok) {
      user = await User.findByIdAndUpdate(
        user._id,
        { entraLoggedAt: new Date(), entraInvitationId: entra.invitationId },
        { new: true },
      )
    }

    const otpDelivery = await sendOtpEmail(email, otp)

    return res.status(200).json({
      message: otpDelivery.delivered
        ? 'OTP sent successfully.'
        : 'OTP generated. Email delivery is not configured yet.',
      devOtp:
        process.env.NODE_ENV === 'development' && !otpDelivery.delivered ? otp : undefined,
      emailDelivered: otpDelivery.delivered,
      emailChannel: otpDelivery.channel,
      emailFailureReason:
        process.env.NODE_ENV === 'development' && !otpDelivery.delivered ? otpDelivery.reason : undefined,
      emailError:
        process.env.NODE_ENV === 'development' && !otpDelivery.delivered ? otpDelivery.error : undefined,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account.', error: String(error) })
  }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const otp = String(req.body.otp || '').trim()

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'No OTP session found. Please sign up again.' })
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please sign up again.' })
    }

    const ok = await bcrypt.compare(otp, user.otpHash)
    if (!ok) return res.status(401).json({ message: 'Invalid OTP.' })

    user.isVerified = true
    user.otpHash = null
    user.otpExpiresAt = null
    await user.save()

    return res.json({ message: 'Account verified. Please log in.' })
  } catch {
    return res.status(500).json({ message: 'Unable to verify OTP.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' })
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Account is not verified. Complete OTP first.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' })

    const token = signToken(user)
    return res.json({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Unable to login.' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = req.user
  return res.json({ user: { userId: user.userId, email: user.email, role: user.role } })
})

app.post('/api/auth/role', authMiddleware, async (req, res) => {
  if (req.user.role) {
    return res.status(400).json({ message: 'Your role is already set. Sign in normally to continue.' })
  }

  const role = String(req.body.role || '')
  const allowedRoles = ['supplier', 'engineer', 'office_estimator', 'client', 'admin']

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected.' })
  }

  req.user.role = role
  await req.user.save()

  return res.json({
    message: 'Role updated successfully.',
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
  })
})

registerNewQuoteApi(app, { authMiddleware: authMiddlewareOrApiKey, requireAdmin })

const start = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment.')
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment.')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const port = Number(process.env.PORT || 4000)
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
