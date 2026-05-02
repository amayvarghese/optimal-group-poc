import type { UserRole } from '../../types/auth'
import { Button } from './Button'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
  /** When set, the matching option is highlighted as the current choice */
  selectedRole?: UserRole | null
}

const roles: { label: string; value: UserRole }[] = [
  { label: 'I am a Supplier', value: 'supplier' },
  { label: 'I am an Engineer', value: 'engineer' },
  { label: 'I am Office Estimator', value: 'office_estimator' },
  { label: 'I am Client', value: 'client' },
  { label: 'I am Admin', value: 'admin' },
]

export const RoleSelector = ({ onSelectRole, selectedRole }: RoleSelectorProps) => {
  return (
    <div className="space-y-3" aria-label="Select your account role">
      {roles.map((role) => (
        <Button
          key={role.value}
          variant={selectedRole === role.value ? 'primary' : 'outline'}
          fullWidth
          onClick={() => onSelectRole(role.value)}
          aria-pressed={selectedRole === role.value}
          aria-label={`Select role ${role.label}`}
          className="h-14 rounded-2xl"
        >
          {role.label}
        </Button>
      ))}
    </div>
  )
}
