import type { AuthSession, SessionStore } from './types'

const SESSION_STORAGE_KEY = 'th.website.auth.session.v1'
const SESSION_GUARD_STORAGE_KEY = 'th.website.auth.session.guard.v1'

const isSessionShape = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AuthSession>
  return (
    typeof session.sessionId === 'string' &&
    typeof session.guardId === 'string' &&
    typeof session.userId === 'string' &&
    (session.role === 'owner' || session.role === 'user') &&
    typeof session.email === 'string' &&
    (session.identityCreatedAt === undefined || typeof session.identityCreatedAt === 'number') &&
    typeof session.createdAt === 'number' &&
    typeof session.expiresAt === 'number'
  )
}

export const createLocalSessionStore = (): SessionStore => ({
  read: () => {
    const guardValue = sessionStorage.getItem(SESSION_GUARD_STORAGE_KEY)
    if (!guardValue) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    const rawValue = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown
      if (!isSessionShape(parsed)) {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        sessionStorage.removeItem(SESSION_GUARD_STORAGE_KEY)
        return null
      }

      const expectedGuard = `${parsed.sessionId}:${parsed.guardId}`
      if (guardValue !== expectedGuard) {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        sessionStorage.removeItem(SESSION_GUARD_STORAGE_KEY)
        return null
      }

      return parsed
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      sessionStorage.removeItem(SESSION_GUARD_STORAGE_KEY)
      return null
    }
  },
  write: (session) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    sessionStorage.setItem(SESSION_GUARD_STORAGE_KEY, `${session.sessionId}:${session.guardId}`)
  },
  clear: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    sessionStorage.removeItem(SESSION_GUARD_STORAGE_KEY)
  },
})
