import type { UserRecord } from '../types/auth'

const STORAGE_KEY = 'optimal_ai_ops_users'

const getCollection = (): UserRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as UserRecord[]
  } catch {
    return []
  }
}

const setCollection = (records: UserRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// Simulates storing user details in MongoDB.
export const upsertUser = async (record: UserRecord): Promise<UserRecord> => {
  const users = getCollection()
  const idx = users.findIndex((user) => user.userId === record.userId)

  if (idx >= 0) {
    users[idx] = record
  } else {
    users.push(record)
  }

  setCollection(users)
  return record
}
