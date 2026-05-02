export type UserRole = 'supplier' | 'engineer' | 'office_estimator' | 'client' | 'admin'

export interface UserRecord {
  userId: string
  email: string
  role: UserRole
}
