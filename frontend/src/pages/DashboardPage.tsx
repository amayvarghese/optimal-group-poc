import { Navigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Logo } from '../components/ui/Logo'
import { AdminDashboard } from '../components/dashboard/AdminDashboard'
import { NonAdminDashboardPlaceholder } from '../components/dashboard/NonAdminDashboardPlaceholder'
import { useAuth } from '../lib/authStore'

export const DashboardPage = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const roleLabel = user.role.replace('_', ' ')

  if (user.role === 'admin') {
    return (
      <main className="min-h-screen bg-brand-black py-6">
        <AdminDashboard userEmail={user.email} onLogout={logout} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-black px-4 py-8 sm:px-6">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="flex flex-col gap-4 border-white/10 bg-black/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Logo className="max-w-[260px]" />
            <p className="text-sm text-gray-300">Signed in as {user.email}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-yellow/90">Role · {roleLabel}</p>
            <p className="text-xs text-gray-500">User ID: {user.userId}</p>
          </div>
          <Button onClick={logout} variant="outline" aria-label="Logout from dashboard">
            Log out
          </Button>
        </Card>

        <NonAdminDashboardPlaceholder role={user.role} />
      </section>
    </main>
  )
}
