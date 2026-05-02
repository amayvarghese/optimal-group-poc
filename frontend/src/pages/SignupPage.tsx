import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { RoleSelector } from '../components/ui/RoleSelector'
import { AuthGridBackground } from '../components/ui/AuthGridBackground'
import { Logo } from '../components/ui/Logo'
import { apiFetch } from '../lib/api'
import type { UserRole } from '../types/auth'

export const SignupPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpHint, setOtpHint] = useState('')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const onSignup = async () => {
    setError('')
    if (!selectedRole) {
      setError('Select your account role before continuing.')
      return
    }
    try {
      const data = await apiFetch<{
        message: string
        devOtp?: string
        emailDelivered?: boolean
        emailFailureReason?: string
        emailError?: string
      }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, confirmPassword, role: selectedRole }),
      })
      setOtpSent(true)
      if (data.emailDelivered) {
        setOtpHint('Check your inbox and Junk folder for the 6-digit code.')
      } else if (data.devOtp) {
        const hint = [`Email was not delivered. Dev OTP: ${data.devOtp}`]
        if (import.meta.env.DEV && (data.emailFailureReason || data.emailError)) {
          hint.push(
            [data.emailFailureReason, data.emailError].filter(Boolean).join(' — '),
          )
        }
        setOtpHint(hint.join(' '))
      } else {
        setOtpHint('Enter the OTP from your email.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up.')
    }
  }

  const onVerifyOtp = async () => {
    setError('')
    try {
      await apiFetch<{ message: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      })
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify OTP.')
    }
  }

  return (
    <AuthGridBackground>
      <div className="space-y-6">
        <div className="flex justify-center">
          <Logo className="max-w-[320px]" />
        </div>
        <Card className="w-full max-w-lg space-y-6">
        <h1 className="text-center text-4xl font-bold text-white">Sign Up</h1>
        <p className="text-center text-sm text-gray-300">
          Sign up with your Microsoft account, choose your role once, then verify with OTP.
        </p>

        {!otpSent ? (
          <div className="space-y-4">
            <Input
              id="signup-email"
              type="email"
              label="Outlook email"
              placeholder="name@outlook.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Signup outlook email input"
            />
            <Input
              id="signup-password"
              type="password"
              label="Password"
              placeholder="Create password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Signup password input"
            />
            <Input
              id="signup-confirm-password"
              type="password"
              label="Confirm password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-label="Signup confirm password input"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-200">Your role</p>
              <p className="text-xs text-gray-400">
                Pick how you use Optimal. This is saved with your account; after you verify OTP you will sign in with this role.
              </p>
              <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
            </div>
            {error ? (
              <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <Button fullWidth onClick={onSignup} aria-label="Sign up">
              Sign Up
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-lg border border-brand-yellow/40 bg-brand-yellow/10 p-3 text-sm text-brand-yellow">
              OTP sent to {email}. Enter OTP to verify your account.
            </p>
            {otpHint ? <p className="text-center text-xs text-gray-400">{otpHint}</p> : null}
            <Input
              id="signup-otp"
              type="text"
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              aria-label="OTP input"
            />
            {error ? (
              <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <Button fullWidth onClick={onVerifyOtp} aria-label="Verify OTP and continue to login">
              Verify OTP
            </Button>
          </div>
        )}
        </Card>
      </div>
    </AuthGridBackground>
  )
}
