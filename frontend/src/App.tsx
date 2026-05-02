import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/authStore'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SignupPage } from './pages/SignupPage'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
