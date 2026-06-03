import type { ProfileRecord, ProfileStore } from './types'

const PROFILE_STORAGE_KEY = 'th.website.profile.records.v1'

const isProfileRecord = (value: unknown): value is ProfileRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<ProfileRecord>
  return (
    typeof record.userId === 'string' &&
    typeof record.displayName === 'string' &&
    typeof record.avatarUrl === 'string' &&
    typeof record.bio === 'string' &&
    typeof record.createdAt === 'number' &&
    typeof record.updatedAt === 'number'
  )
}

export const createLocalProfileStore = (): ProfileStore => ({
  readAll: () => {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      return []
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter(isProfileRecord) : []
    } catch {
      return []
    }
  },
  writeAll: (profiles) => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles))
  },
})
