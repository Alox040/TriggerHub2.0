import type { SessionStore } from './types'

const SESSION_STORAGE_KEY = 'th.website.auth.session.v1'
const SESSION_GUARD_STORAGE_KEY = 'th.website.auth.session.guard.v1'

const clearLegacySessionStorage = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY)
  sessionStorage.removeItem(SESSION_GUARD_STORAGE_KEY)
}

export const createLocalSessionStore = (): SessionStore => ({
  read: () => {
    clearLegacySessionStorage()
    return null
  },
  write: (session) => {
    void session
    clearLegacySessionStorage()
  },
  clear: () => {
    clearLegacySessionStorage()
  },
})
