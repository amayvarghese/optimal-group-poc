import type { UserRole } from '../../types/auth'
import { Card } from '../ui/Card'

const roleLabels: Record<UserRole, string> = {
  supplier: 'Supplier',
  engineer: 'Engineer',
  office_estimator: 'Office estimator',
  client: 'Client',
  admin: 'Admin',
}

interface NonAdminDashboardPlaceholderProps {
  role: UserRole
}

export const NonAdminDashboardPlaceholder = ({ role }: NonAdminDashboardPlaceholderProps) => {
  const label = roleLabels[role]
  return (
    <Card className="border-white/10 bg-black/40 p-8">
      <h2 className="text-xl font-semibold text-white">{label} workspace</h2>
      <p className="mt-3 max-w-xl text-sm text-gray-400">
        This role&apos;s dashboard is not built yet. You are signed in correctly; we&apos;ll add tools and lists
        specific to {label.toLowerCase()}s in a later pass.
      </p>
      <p className="mt-6 text-xs text-gray-500">Role key: {role}</p>
    </Card>
  )
}
