import type { ProfileCacheStore, UserProfileView } from './types'

const PROFILE_CACHE_KEY = 'th.website.profile.cache.v1'

type ProfileCacheRecord = Record<string, UserProfileView>

const isUserProfileView = (value: unknown): value is UserProfileView => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const profile = value as Partial<UserProfileView>
  return (
    typeof profile.user_id === 'string' &&
    typeof profile.display_name === 'string' &&
    typeof profile.avatar_url === 'string' &&
    typeof profile.bio === 'string' &&
    (profile.role === 'owner' || profile.role === 'user')
  )
}

const readCache = (): ProfileCacheRecord => {
  if (typeof localStorage === 'undefined') {
    return {}
  }

  const raw = localStorage.getItem(PROFILE_CACHE_KEY)
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, UserProfileView] =>
        isUserProfileView(entry[1]),
      ),
    )
  } catch {
    return {}
  }
}

const writeCache = (cache: ProfileCacheRecord): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache))
}

export const createLocalProfileCacheStore = (): ProfileCacheStore => ({
  read: (userId) => readCache()[userId] ?? null,
  write: (profile) => {
    const cache = readCache()
    cache[profile.user_id] = profile
    writeCache(cache)
  },
  clear: (userId) => {
    const cache = readCache()
    delete cache[userId]
    writeCache(cache)
  },
})
