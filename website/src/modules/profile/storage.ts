import type { ProfileRecord } from './types'

export const PROFILE_STORE_FILENAME = 'triggerhub.website.profiles.v1.json'

export const isProfileRecord = (value: unknown): value is ProfileRecord => {
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
