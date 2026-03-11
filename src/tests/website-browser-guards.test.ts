import { beforeEach, describe, expect, it } from 'vitest'
import { createLocalSessionStore } from '../../website/src/modules/auth/sessionStore'
import type { AuthSession } from '../../website/src/modules/auth/types'

const buildSession = (): AuthSession => ({
  sessionId: '0123456789abcdef0123456789abcdef',
  guardId: 'fedcba9876543210fedcba9876543210',
  userId: 'owner',
  role: 'owner',
  email: 'owner@example.com',
  createdAt: Date.now(),
  expiresAt: Date.now() + 60_000,
})

describe('website session guard in browser context', () => {
  const createStorageMock = (): Storage => {
    const state = new Map<string, string>()
    return {
      get length() {
        return state.size
      },
      clear: () => state.clear(),
      getItem: (key: string) => state.get(key) ?? null,
      key: (index: number) => Array.from(state.keys())[index] ?? null,
      removeItem: (key: string) => {
        state.delete(key)
      },
      setItem: (key: string, value: string) => {
        state.set(key, value)
      },
    }
  }

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    })
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    })
  })

  it('clears local session when guard token is missing', () => {
    const sessionStore = createLocalSessionStore()
    const session = buildSession()
    localStorage.setItem('th.website.auth.session.v1', JSON.stringify(session))

    const hydrated = sessionStore.read()
    expect(hydrated).toBeNull()
    expect(localStorage.getItem('th.website.auth.session.v1')).toBeNull()
  })

  it('clears local session when guard token mismatches', () => {
    const sessionStore = createLocalSessionStore()
    const session = buildSession()
    localStorage.setItem('th.website.auth.session.v1', JSON.stringify(session))
    sessionStorage.setItem('th.website.auth.session.guard.v1', `${session.sessionId}:wrong-token`)

    const hydrated = sessionStore.read()
    expect(hydrated).toBeNull()
    expect(localStorage.getItem('th.website.auth.session.v1')).toBeNull()
    expect(sessionStorage.getItem('th.website.auth.session.guard.v1')).toBeNull()
  })
})
