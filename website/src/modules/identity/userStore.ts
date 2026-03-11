import type { UserRecord, UserStore } from './types'

const USERS_STORAGE_KEY = 'th.website.identity.users.v1'

const isUserRecord = (value: unknown): value is UserRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<UserRecord>
  return (
    typeof record.id === 'string' &&
    (record.role === 'owner' || record.role === 'user') &&
    typeof record.createdAt === 'number' &&
    typeof record.updatedAt === 'number'
  )
}

export const createLocalUserStore = (): UserStore => ({
  readAll: () => {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      return []
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter(isUserRecord) : []
    } catch {
      return []
    }
  },
  writeAll: (users) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  },
})
