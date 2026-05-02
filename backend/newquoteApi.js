import mongoose from 'mongoose'
import crypto from 'node:crypto'
import { buildPricingInputText, computePricingEstimate } from './pricingEngine.js'

/** @typedef {{ authMiddleware: import('express').RequestHandler, requireAdmin: import('express').RequestHandler }} RegisterOpts */

const QUOTE_STATUSES = [
  'draft',
  'converted',
  'actioned',
  'callback',
  'accepted',
  'rejected',
  'sales_appointment',
]

/** How the quote is delivered / classified (admin new-quote UI). */
export const QUOTE_TYPE_VALUES = ['to_be_determined', 'desktop', 'attend', 'supply_chain']

const quoteAttachmentSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    /** Base64 payload (no data: URL prefix). Large files increase document size. */
    fileBase64: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const requestClientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, default: '', trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    county: { type: String, default: '' },
    postcode: { type: String, default: '' },
    country: { type: String, default: 'United Kingdom' },
    telephone: { type: String, default: '' },
    mobile: { type: String, default: '' },
    whatsApp: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { timestamps: true, collection: 'requests-clients' },
)

const pricingMatchResultSchema = new mongoose.Schema(
  {
    category: { type: String, default: '' },
    service: { type: String, default: '' },
    priceRangeRaw: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    mid: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { _id: false },
)

const pricingEstimateSchema = new mongoose.Schema(
  {
    totalMin: { type: Number, default: 0 },
    totalMax: { type: Number, default: 0 },
    totalMid: { type: Number, default: 0 },
    currency: { type: String, default: 'GBP' },
    matches: { type: [pricingMatchResultSchema], default: [] },
    inputText: { type: String, default: '' },
    computedAt: { type: Date },
  },
  { _id: false },
)

const lineItemSchema = new mongoose.Schema(
  {
    code: { type: String, default: '' },
    product: { type: String, default: '' },
    description: { type: String, default: '' },
    accountCode: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    costCalc: { type: String, default: '' },
    pricePounds: { type: Number, default: 0 },
    markupPct: { type: Number, default: 0 },
    vatPct: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  { _id: false },
)

const requestQuoteSchema = new mongoose.Schema(
  {
    quoteId: { type: String, required: true, unique: true, index: true },
    quoteRef: { type: String, required: true, unique: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestClient', required: true, index: true },
    status: {
      type: String,
      enum: QUOTE_STATUSES,
      default: 'draft',
      index: true,
    },
    billing: {
      contact: { type: String, default: '' },
      name: { type: String, default: '' },
      company: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      county: { type: String, default: '' },
      postcode: { type: String, default: '' },
      telephone: { type: String, default: '' },
      mobile: { type: String, default: '' },
      whatsApp: { type: String, default: '' },
      email: { type: String, default: '' },
      country: { type: String, default: 'United Kingdom' },
    },
    site: {
      siteKey: { type: String, default: 'None' },
      name: { type: String, default: '' },
      company: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      county: { type: String, default: '' },
      postcode: { type: String, default: '' },
      telephone: { type: String, default: '' },
      mobile: { type: String, default: '' },
      country: { type: String, default: 'United Kingdom' },
    },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    shortDescription: { type: String, default: '' },
    lineItems: { type: [lineItemSchema], default: [] },
    createdByUserId: { type: String, default: '' },
    typeOfQuote: {
      type: String,
      enum: QUOTE_TYPE_VALUES,
      default: 'to_be_determined',
      index: true,
    },
    /** Rich text (HTML) from the Extra information — Description field. */
    extraDescription: { type: String, default: '' },
    customerNotes: { type: String, default: '' },
    attachments: { type: [quoteAttachmentSchema], default: [] },
    /** Midpoint sum (or single band) from UK maintenance pricing catalog — set by pricing API. */
    estimatedQuoteTotal: { type: Number, default: null },
    pricingEstimate: { type: pricingEstimateSchema, default: null },
  },
  { timestamps: true, collection: 'requests-quotes' },
)

export const RequestClient =
  mongoose.models.RequestClient || mongoose.model('RequestClient', requestClientSchema)
export const RequestQuote =
  mongoose.models.RequestQuote || mongoose.model('RequestQuote', requestQuoteSchema)

/**
 * @param {unknown} raw
 * @returns {Array<{ title: string, fileName: string, mimeType: string, fileBase64: string, uploadedAt: Date }>}
 */
function normalizeAttachmentsFromBody(raw) {
  if (!Array.isArray(raw)) return []
  const out = []
  for (const a of raw) {
    if (!a || typeof a !== 'object') continue
    let fileBase64 =
      typeof a.fileBase64 === 'string' ? a.fileBase64.replace(/^data:[^;]+;base64,/i, '').trim() : ''
    if (!fileBase64) continue
    // BSON document limit safety (~16MB total doc); cap each file string
    fileBase64 = fileBase64.slice(0, 12 * 1024 * 1024)
    out.push({
      title: String(a.title || '').trim().slice(0, 500),
      fileName: String(a.fileName || '').slice(0, 255),
      mimeType: String(a.mimeType || '').slice(0, 128),
      fileBase64,
      uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date(),
    })
  }
  return out
}

/**
 * Next quote reference: letter Q + numeric sequence (e.g. Q00001, Q00042).
 * Supports legacy refs like Q-2026-0001 when computing the next number.
 * Callable from anywhere in the backend.
 */
export async function generateQuoteRef() {
  const rows = await RequestQuote.find({}).select('quoteRef').lean()
  let max = 0
  for (const { quoteRef } of rows) {
    if (!quoteRef || typeof quoteRef !== 'string') continue
    if (/^Q\d+$/.test(quoteRef)) {
      const n = parseInt(quoteRef.slice(1), 10)
      if (!Number.isNaN(n) && n > max) max = n
      continue
    }
    const legacy = /^Q-(\d{4})-(\d+)$/.exec(quoteRef)
    if (legacy) {
      const n = parseInt(legacy[2], 10)
      if (!Number.isNaN(n) && n > max) max = n
    }
  }
  const next = max + 1
  return `Q${String(next).padStart(5, '0')}`
}

/**
 * List clients for dropdowns / integrations.
 * @returns {Promise<Array<{ clientId: string, displayName: string, companyName: string, contactName: string }>>}
 */
export async function listRequestClients() {
  const rows = await RequestClient.find({}).sort({ companyName: 1 }).lean()
  return rows.map((c) => ({
    _id: String(c._id),
    clientId: c.clientId,
    displayName: [c.contactName, c.companyName].filter(Boolean).join(' — ') || c.companyName,
    companyName: c.companyName,
    contactName: c.contactName,
    city: c.city,
    email: c.email,
  }))
}

/**
 * Counts for admin quote status chips. `new` / `search` are omitted or null (no badge until you define rules).
 * @returns {Promise<Record<string, number | null>>}
 */
export async function getQuoteStatusCounts() {
  const total = await RequestQuote.countDocuments()
  const byStatus = {}
  for (const s of QUOTE_STATUSES) {
    byStatus[s] = await RequestQuote.countDocuments({ status: s })
  }
  return {
    search: total > 0 ? total : null,
    new: null,
    drafts: byStatus.draft > 0 ? byStatus.draft : null,
    converted: byStatus.converted > 0 ? byStatus.converted : null,
    actioned: byStatus.actioned > 0 ? byStatus.actioned : null,
    callback: byStatus.callback > 0 ? byStatus.callback : null,
    accepted: byStatus.accepted > 0 ? byStatus.accepted : null,
    rejected: byStatus.rejected > 0 ? byStatus.rejected : null,
    sales_appointment: byStatus.sales_appointment > 0 ? byStatus.sales_appointment : null,
  }
}

/**
 * Create a quote document. Callable from other routes or jobs.
 * @param {object} body - Same shape as POST /api/newquote-api body
 * @param {string} [createdByUserId]
 */
export async function createNewQuote(body, createdByUserId = '') {
  const b = body && typeof body === 'object' ? body : {}
  const rawClient = b.clientObjectId || b.clientId
  if (!rawClient) {
    const err = new Error('Client id is required (Mongo _id or clientId UUID).')
    err.statusCode = 400
    throw err
  }

  let client = null
  if (mongoose.isValidObjectId(String(rawClient))) {
    client = await RequestClient.findById(rawClient)
  }
  if (!client) {
    client = await RequestClient.findOne({ clientId: String(rawClient) })
  }
  if (!client) {
    const err = new Error('Client not found.')
    err.statusCode = 404
    throw err
  }

  const quoteRef = await generateQuoteRef()
  const quoteId = crypto.randomUUID()

  const typeOfQuote =
    b.typeOfQuote && QUOTE_TYPE_VALUES.includes(String(b.typeOfQuote)) ? String(b.typeOfQuote) : 'to_be_determined'

  const rawCustom =
    b.customFields && typeof b.customFields === 'object' && !Array.isArray(b.customFields) ? { ...b.customFields } : {}
  delete rawCustom.typeOfQuote

  const doc = await RequestQuote.create({
    quoteId,
    quoteRef,
    clientId: client._id,
    status: b.status && QUOTE_STATUSES.includes(b.status) ? b.status : 'draft',
    billing: b.billing || {},
    site: b.site || {},
    customFields: rawCustom,
    shortDescription: String(b.shortDescription || ''),
    lineItems: Array.isArray(b.lineItems) ? b.lineItems : [],
    createdByUserId: createdByUserId || String(b.createdByUserId || ''),
    typeOfQuote,
    extraDescription: String(b.extraDescription ?? ''),
    customerNotes: String(b.customerNotes ?? ''),
    attachments: normalizeAttachmentsFromBody(b.attachments),
  })

  return doc.toObject()
}

/**
 * Stable handoff payload for an external estimator (or downstream job) right after quote creation.
 * @param {Record<string, unknown>} quote - `createNewQuote` return value
 * @param {Record<string, unknown> | null | undefined} client - lean `RequestClient` or null
 */
export function buildEstimatorHandoff(quote, client) {
  const qid = quote._id
  return {
    quoteMongoId: String(qid),
    quoteId: String(quote.quoteId || ''),
    quoteRef: String(quote.quoteRef || ''),
    status: String(quote.status || 'draft'),
    typeOfQuote: String(quote.typeOfQuote || 'to_be_determined'),
    shortDescription: String(quote.shortDescription || ''),
    extraDescriptionHtmlLength:
      typeof quote.extraDescription === 'string' ? quote.extraDescription.length : 0,
    customerNotesLength: typeof quote.customerNotes === 'string' ? quote.customerNotes.length : 0,
    clientMongoId: String(quote.clientId || ''),
    clientUuid: client ? String(client.clientId || '') : '',
    clientCompany: client ? String(client.companyName || '') : '',
    clientContact: client ? String(client.contactName || '') : '',
    clientEmail: client ? String(client.email || '') : '',
    site: quote.site && typeof quote.site === 'object' ? quote.site : {},
    billing: quote.billing && typeof quote.billing === 'object' ? quote.billing : {},
    lineItems: Array.isArray(quote.lineItems)
      ? quote.lineItems.map((li) => ({
          code: String(li.code || ''),
          product: String(li.product || ''),
          description: String(li.description || ''),
          qty: Number(li.qty) || 0,
        }))
      : [],
    attachmentCount: Array.isArray(quote.attachments) ? quote.attachments.length : 0,
    customFields: quote.customFields && typeof quote.customFields === 'object' ? quote.customFields : {},
    createdAt: quote.createdAt ? new Date(quote.createdAt).toISOString() : undefined,
    createdByUserId: String(quote.createdByUserId || ''),
    opsPricingApi: {
      method: 'POST',
      path: '/api/newquote-api/quotes/pricing',
      body: {
        quoteMongoId: String(qid),
        quoteRef: String(quote.quoteRef || ''),
        quoteId: String(quote.quoteId || ''),
      },
    },
  }
}

/**
 * Register REST routes under `/api/newquote-api/*`.
 * @param {import('express').Express} app
 * @param {RegisterOpts} opts
 */
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function registerNewQuoteApi(app, opts) {
  const { authMiddleware, requireAdmin } = opts

  app.get('/api/newquote-api/clients', authMiddleware, requireAdmin, async (_req, res) => {
    try {
      const clients = await listRequestClients()
      return res.json({ clients })
    } catch (e) {
      return res.status(500).json({ message: 'Unable to list clients.' })
    }
  })

  /**
   * Find clients by partial **company** or **contact** name (case-insensitive).
   * `GET /api/newquote-api/clients/lookup?name=Expats` or `?q=Expats`
   */
  app.get('/api/newquote-api/clients/lookup', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const raw =
        req.query.name != null ? String(req.query.name) : req.query.q != null ? String(req.query.q) : ''
      const q = raw.trim()
      if (q.length < 2) {
        return res.status(400).json({
          message: 'Provide query "name" or "q" with at least 2 characters (company or contact name).',
        })
      }
      const re = new RegExp(escapeRegex(q), 'i')
      const rows = await RequestClient.find({
        $or: [{ companyName: re }, { contactName: re }],
      })
        .select('_id clientId companyName contactName email')
        .sort({ companyName: 1 })
        .limit(50)
        .lean()

      return res.json({
        query: q,
        count: rows.length,
        clients: rows.map((c) => ({
          _id: String(c._id),
          clientId: c.clientId,
          companyName: c.companyName,
          contactName: c.contactName || '',
          email: c.email || '',
        })),
      })
    } catch (e) {
      console.error('[GET /api/newquote-api/clients/lookup]', e)
      return res.status(500).json({ message: 'Unable to look up clients.' })
    }
  })

  app.post('/api/newquote-api/clients', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const companyName = String(body.companyName || '').trim()
      if (!companyName) {
        return res.status(400).json({ message: 'companyName is required.' })
      }
      const client = await RequestClient.create({
        clientId: crypto.randomUUID(),
        companyName,
        contactName: String(body.contactName || '').trim(),
        address: String(body.address || ''),
        city: String(body.city || ''),
        county: String(body.county || ''),
        postcode: String(body.postcode || ''),
        country: String(body.country || 'United Kingdom'),
        telephone: String(body.telephone || ''),
        mobile: String(body.mobile || ''),
        whatsApp: String(body.whatsApp || body.whatsapp || ''),
        email: String(body.email || ''),
      })
      return res.status(201).json({
        client: {
          _id: String(client._id),
          clientId: client.clientId,
          companyName: client.companyName,
          contactName: client.contactName,
        },
      })
    } catch (e) {
      console.error('[POST /api/newquote-api/clients]', e)
      const dup = e?.code === 11000
      const status = dup ? 409 : 500
      const message =
        typeof e?.message === 'string' && e.message.length > 0
          ? e.message
          : 'Unable to create client (check server logs).'
      return res.status(status).json({ message })
    }
  })

  app.get('/api/newquote-api/stats', authMiddleware, requireAdmin, async (_req, res) => {
    try {
      const counts = await getQuoteStatusCounts()
      return res.json({ counts })
    } catch {
      return res.status(500).json({ message: 'Unable to load stats.' })
    }
  })

  /**
   * List quotes (newest first). Optional `?status=draft` etc. must match `QUOTE_STATUSES`.
   */
  app.get('/api/newquote-api/quotes', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const statusQ = req.query.status != null ? String(req.query.status).trim() : ''
      const filter = {}
      if (statusQ && QUOTE_STATUSES.includes(statusQ)) {
        filter.status = statusQ
      }
      const rows = await RequestQuote.find(filter)
        .sort({ updatedAt: -1 })
        .limit(200)
        .populate('clientId', 'companyName contactName')
        .lean()

      const quotes = rows.map((q) => {
        const client = q.clientId && typeof q.clientId === 'object' && !Array.isArray(q.clientId) ? q.clientId : null
        const pe = q.pricingEstimate
        const primary = pe?.matches?.[0]
        return {
          _id: String(q._id),
          quoteRef: q.quoteRef,
          quoteId: q.quoteId,
          status: q.status,
          shortDescription: q.shortDescription || '',
          typeOfQuote: q.typeOfQuote,
          updatedAt: q.updatedAt,
          createdAt: q.createdAt,
          estimatedQuoteTotal: q.estimatedQuoteTotal ?? null,
          estimateRange:
            pe && typeof pe.totalMin === 'number' && typeof pe.totalMax === 'number'
              ? `£${pe.totalMin}–£${pe.totalMax}`
              : null,
          estimateLabel: primary ? `${primary.category} — ${primary.service}` : null,
          clientCompany: client?.companyName || '',
          clientContact: client?.contactName || '',
        }
      })
      return res.json({ quotes })
    } catch (e) {
      console.error('[GET /api/newquote-api/quotes]', e)
      return res.status(500).json({ message: 'Unable to list quotes.' })
    }
  })

  app.post('/api/newquote-api', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const quote = await createNewQuote(req.body, req.user.userId)
      const client = await RequestClient.findById(quote.clientId).lean()
      const estimator = buildEstimatorHandoff(quote, client)
      return res.status(201).json({ quote, estimator })
    } catch (e) {
      const code = e.statusCode || 500
      return res.status(code).json({ message: e.message || 'Unable to create quote.' })
    }
  })

  app.post('/api/newquote-api/quote', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const quote = await createNewQuote(req.body, req.user.userId)
      const client = await RequestClient.findById(quote.clientId).lean()
      const estimator = buildEstimatorHandoff(quote, client)
      return res.status(201).json({ quote, estimator })
    } catch (e) {
      const code = e.statusCode || 500
      return res.status(code).json({ message: e.message || 'Unable to create quote.' })
    }
  })

  /**
   * Match `description` (or the quote’s own text) against `data/uk_property_maintenance_prices.csv`,
   * then persist totals on the quote.
   * Body: `{ quoteMongoId?, quoteRef?, quoteId?, description? }` — one of the first three required.
   */
  app.post('/api/newquote-api/quotes/pricing', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const quoteRef = body.quoteRef ? String(body.quoteRef).trim() : ''
      const quoteMongoId = body.quoteMongoId ? String(body.quoteMongoId).trim() : ''
      const quoteIdUuid = body.quoteId ? String(body.quoteId).trim() : ''
      const descriptionOverride = body.description != null ? String(body.description) : ''

      if (!quoteRef && !quoteMongoId && !quoteIdUuid) {
        return res.status(400).json({
          message: 'Provide quoteMongoId, quoteRef, or quoteId (UUID) to identify the quote.',
        })
      }

      let q = null
      if (quoteMongoId && mongoose.isValidObjectId(quoteMongoId)) {
        q = await RequestQuote.findById(quoteMongoId)
      }
      if (!q && quoteRef) q = await RequestQuote.findOne({ quoteRef })
      if (!q && quoteIdUuid) q = await RequestQuote.findOne({ quoteId: quoteIdUuid })

      if (!q) {
        return res.status(404).json({ message: 'Quote not found.' })
      }

      const lean = q.toObject()
      const inputText = buildPricingInputText(lean, descriptionOverride)
      const est = computePricingEstimate(inputText)
      const computedAt = new Date()
      const pricingEstimate = {
        totalMin: est.totalMin,
        totalMax: est.totalMax,
        totalMid: est.totalMid,
        currency: est.currency,
        matches: est.matches.map((m) => ({
          category: m.category,
          service: m.service,
          priceRangeRaw: m.priceRangeRaw,
          min: m.min,
          max: m.max,
          mid: m.mid,
          score: m.score,
        })),
        inputText: inputText.slice(0, 8000),
        computedAt,
      }
      const estimatedQuoteTotal = est.matches.length > 0 ? est.totalMid : null

      await RequestQuote.updateOne({ _id: q._id }, { $set: { pricingEstimate, estimatedQuoteTotal } })

      const updated = await RequestQuote.findById(q._id).lean()
      return res.json({ quote: updated, pricingEstimate })
    } catch (e) {
      console.error('[POST /api/newquote-api/quotes/pricing]', e)
      return res.status(500).json({ message: typeof e?.message === 'string' ? e.message : 'Pricing failed.' })
    }
  })
}
