import type { UserRole } from '../../types/auth'
import { Card } from './Card'

interface RoleDashboardPreviewProps {
  role: UserRole
}

const roleContent: Record<UserRole, { title: string; points: string[] }> = {
  supplier: {
    title: 'Supplier Dashboard',
    points: ['New RFQs', 'Delivery schedule', 'Pending invoices'],
  },
  engineer: {
    title: 'Engineer Dashboard',
    points: ['Assigned jobs', 'Site checklists', 'Critical alerts'],
  },
  office_estimator: {
    title: 'Office Estimator Dashboard',
    points: ['Estimate pipeline', 'Cost breakdowns', 'Approval queue'],
  },
  client: {
    title: 'Client Dashboard',
    points: ['Project timeline', 'Support tickets', 'Recent reports'],
  },
  admin: {
    title: 'Admin Dashboard',
    points: ['User access', 'Global metrics', 'Audit logs'],
  },
}

export const RoleDashboardPreview = ({ role }: RoleDashboardPreviewProps) => {
  const selected = roleContent[role]

  return (
    <Card>
      <h2 className="text-xl font-semibold text-white">{selected.title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-gray-300">
        {selected.points.map((point) => (
          <li key={point} className="rounded-xl border border-white/10 bg-black p-3">
            {point}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs text-gray-400">
        Detailed module dashboards will be added in the next phase.
      </p>
    </Card>
  )
}
