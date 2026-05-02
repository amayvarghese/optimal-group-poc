import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { RoleSelector } from '../components/ui/RoleSelector'
import { useAuth } from '../lib/authStore'
import type { UserRole } from '../types/auth'
import { AuthGridBackground } from '../components/ui/AuthGridBackground'
import { Logo } from '../components/ui/Logo'

export const LoginPage = () => {
  const { pendingUser, loginWithPassword, chooseRole } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onLogin = async () => {
    try {
      setError('')
      if (!password.trim()) {
        throw new Error('Password is required.')
      }
      const fullySignedIn = await loginWithPassword(email, password)
      if (fullySignedIn) {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    }
  }

  const onRoleSelect = async (role: UserRole) => {
    await chooseRole(role)
    navigate('/dashboard')
  }

  return (
    <AuthGridBackground>
      <div className="space-y-6">
        <div className="flex justify-center">
          <Logo className="max-w-[320px]" />
        </div>
        <Card className="w-full max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Log In</h1>
          <p className="text-sm text-gray-300">
            Sign in with your Microsoft account.
          </p>
        </div>

        {!pendingUser ? (
          <div className="space-y-4">
            <Input
              id="microsoft-email"
              type="email"
              label="Outlook email"
              placeholder="name@outlook.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Outlook email input"
            />
            <Input
              id="microsoft-password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Password input"
            />
            {error ? (
              <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <Button onClick={onLogin} fullWidth aria-label="Log in">
              Log In
            </Button>
          </div>
        ) : (
          <section className="space-y-4" aria-label="Choose role after login">
            <p className="rounded-lg border border-brand-yellow/40 bg-brand-yellow/10 p-3 text-sm text-brand-yellow">
              Signed in as {pendingUser.email}. Your account has no role yet—select one to continue. New accounts
              choose a role during sign up.
            </p>
            <RoleSelector onSelectRole={onRoleSelect} />
          </section>
        )}
        </Card>
      </div>
    </AuthGridBackground>
  )
}
