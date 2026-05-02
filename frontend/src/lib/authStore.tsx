/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { apiFetch } from './api'
import type { UserRecord, UserRole } from '../types/auth'

interface AuthContextValue {
  user: UserRecord | null
  pendingUser: { userId: string; email: string } | null
  /** Resolves to `true` when the user is fully signed in (has a role). `false` when they must pick a role on this screen. */
  loginWithPassword: (email: string, password: string) => Promise<boolean>
  chooseRole: (role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const SESSION_KEY = 'optimal_ai_ops_session'
const TOKEN_KEY = 'optimal_ai_ops_token'

const getStoredSession = (): UserRecord | null => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as UserRecord
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<UserRecord | null>(() => getStoredSession())
  const [pendingUser, setPendingUser] = useState<{ userId: string; email: string } | null>(null)

  const loginWithPassword = async (email: string, password: string) => {
    const data = await apiFetch<{
      token: string
      user: UserRecord
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem(TOKEN_KEY, data.token)

    if (!data.user.role) {
      setPendingUser({ userId: data.user.userId, email: data.user.email })
      setUser(null)
      localStorage.removeItem(SESSION_KEY)
      return false
    }

    setUser(data.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
    setPendingUser(null)
    return true
  }

  const chooseRole = async (role: UserRole) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || !pendingUser) return

    const data = await apiFetch<{
      user: UserRecord
    }>('/api/auth/role', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    })

    setUser(data.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
    setPendingUser(null)
  }

  const logout = () => {
    setUser(null)
    setPendingUser(null)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  const value = { user, pendingUser, loginWithPassword, chooseRole, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
