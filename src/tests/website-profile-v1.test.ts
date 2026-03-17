import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import gateLoginHandler from '../../website/api/prelaunch-gate/login'
import gateMeHandler from '../../website/api/prelaunch-gate/me'
import authLoginHandler from '../../website/api/auth/login'
import profileHandler from '../../website/api/profile/me'
import { resetInMemorySecurityGuardsForTests } from '../../website/api/_security'
import { resetProfileStoreForTests, setProfileStorageForTests } from '../../website/api/_profile'
import { FileProfileStorage } from '../../website/src/modules/profile/fileProfileStorage'
import { ProfileService, ProfileServiceError } from '../../website/src/modules/profile/profileService'
import type { ProfileCacheStore, ProfileRecord, ProfileStoragePort, UserProfileView } from '../../website/src/modules/profile/types'
import { ProfileValidationError } from '../../website/src/modules/profile/validation'

interface MockRequestInit {
  method: string
  body?: unknown
  headers?: Record<string, string>
}

interface MockResponse {
  statusCode: number
  headers: Record<string, string | string[]>
  body: string
}

const createMockRequest = ({ method, body, headers }: MockRequestInit) =>
  ({
    method,
    body,
    headers: headers ?? {},
  }) as never

const createMockResponse = (): { res: never; state: MockResponse } => {
  const state: MockResponse = {
    statusCode: 200,
    headers: {},
    body: '',
  }

  const res = {
    status(code: number) {
      state.statusCode = code
      return this
    },
    setHeader(name: string, value: string | string[]) {
      state.headers[name] = value
      return this
    },
    send(payload: string) {
      state.body = payload
      return this
    },
  }

  return { res: res as never, state }
}

const parseJsonBody = (body: string): unknown => JSON.parse(body)

const getSetCookieValues = (setCookieHeader: string | string[] | undefined): string[] => {
  if (!setCookieHeader) {
    throw new Error('Set-Cookie header missing')
  }

  return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
}

const extractCookiePair = (setCookieHeader: string | string[] | undefined, cookieName: string): string => {
  const matchingCookie = getSetCookieValues(setCookieHeader).find((cookie) => cookie.startsWith(`${cookieName}=`))
  if (!matchingCookie) {
    throw new Error(`Cookie pair missing for ${cookieName}`)
  }

  const [cookiePair] = matchingCookie.split(';')
  return cookiePair
}

const extractCsrfTokenFromCookie = (cookiePair: string): string => cookiePair.slice('th_csrf='.length)

const createMemoryCacheStore = (): ProfileCacheStore => {
  const cache = new Map<string, UserProfileView>()

  return {
    read: (userId) => cache.get(userId) ?? null,
    write: (profile) => {
      cache.set(profile.user_id, profile)
    },
    clear: (userId) => {
      cache.delete(userId)
    },
  }
}

const createMemoryProfileStorage = (): ProfileStoragePort & { records: Map<string, ProfileRecord> } => {
  const records = new Map<string, ProfileRecord>()

  return {
    records,
    getProfile: async (userId) => records.get(userId) ?? null,
    saveProfile: async (profile) => {
      records.set(profile.userId, { ...profile })
    },
    updateProfile: async (profile) => {
      if (!records.has(profile.userId)) {
        return
      }

      records.set(profile.userId, { ...profile })
    },
    deleteProfile: async (userId) => {
      records.delete(userId)
    },
  }
}

describe('website profile v2', () => {
  let profileStorage: ReturnType<typeof createMemoryProfileStorage>

  const originalEnv = {
    accessMode: process.env.VITE_ACCESS_MODE,
    sessionTtlMs: process.env.VITE_SESSION_TTL_MS,
    ownerUserId: process.env.OWNER_USER_ID,
    ownerEmail: process.env.OWNER_EMAIL,
    ownerUsername: process.env.OWNER_LOGIN_USERNAME,
    ownerPasswordHash: process.env.OWNER_LOGIN_PASSWORD_HASH,
    ownerPasswordSalt: process.env.OWNER_LOGIN_PASSWORD_SALT,
    ownerPasswordIterations: process.env.OWNER_LOGIN_PASSWORD_ITERATIONS,
    sessionSecret: process.env.PRELAUNCH_SESSION_SECRET,
    accessKey: process.env.PRELAUNCH_ACCESS_KEY,
    gateTtlMs: process.env.PRELAUNCH_GATE_TTL_MS,
    profileStorePath: process.env.PROFILE_STORE_PATH,
  }

  beforeEach(async () => {
    const password = 'change-me-owner-password'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), iterations, 32, 'sha256').toString('base64')

    process.env.VITE_ACCESS_MODE = 'private_prelaunch'
    process.env.VITE_SESSION_TTL_MS = '28800000'
    process.env.OWNER_USER_ID = 'owner'
    process.env.OWNER_EMAIL = 'owner@example.com'
    process.env.OWNER_LOGIN_USERNAME = 'owner'
    process.env.OWNER_LOGIN_PASSWORD_HASH = hash
    process.env.OWNER_LOGIN_PASSWORD_SALT = salt
    process.env.OWNER_LOGIN_PASSWORD_ITERATIONS = String(iterations)
    process.env.PRELAUNCH_SESSION_SECRET = 'test-session-secret'
    process.env.PRELAUNCH_ACCESS_KEY = 'test-access-key'
    process.env.PRELAUNCH_GATE_TTL_MS = '43200000'
    profileStorage = createMemoryProfileStorage()
    setProfileStorageForTests(profileStorage)
    resetInMemorySecurityGuardsForTests()
  })

  afterEach(async () => {
    process.env.VITE_ACCESS_MODE = originalEnv.accessMode
    process.env.VITE_SESSION_TTL_MS = originalEnv.sessionTtlMs
    process.env.OWNER_USER_ID = originalEnv.ownerUserId
    process.env.OWNER_EMAIL = originalEnv.ownerEmail
    process.env.OWNER_LOGIN_USERNAME = originalEnv.ownerUsername
    process.env.OWNER_LOGIN_PASSWORD_HASH = originalEnv.ownerPasswordHash
    process.env.OWNER_LOGIN_PASSWORD_SALT = originalEnv.ownerPasswordSalt
    process.env.OWNER_LOGIN_PASSWORD_ITERATIONS = originalEnv.ownerPasswordIterations
    process.env.PRELAUNCH_SESSION_SECRET = originalEnv.sessionSecret
    process.env.PRELAUNCH_ACCESS_KEY = originalEnv.accessKey
    process.env.PRELAUNCH_GATE_TTL_MS = originalEnv.gateTtlMs
    process.env.PROFILE_STORE_PATH = originalEnv.profileStorePath
    resetInMemorySecurityGuardsForTests()
    setProfileStorageForTests()
    await resetProfileStoreForTests()
    vi.restoreAllMocks()
  })

  const primeCsrfCookie = (): { cookiePair: string; csrfToken: string } => {
    const csrfBootstrap = createMockResponse()
    gateMeHandler(createMockRequest({ method: 'GET' }), csrfBootstrap.res)
    const cookiePair = extractCookiePair(csrfBootstrap.state.headers['Set-Cookie'], 'th_csrf')

    return {
      cookiePair,
      csrfToken: extractCsrfTokenFromCookie(cookiePair),
    }
  }

  const createAuthenticatedCookies = (): { authCookie: string; gateCookie: string; csrfCookie: string; csrfToken: string } => {
    const { cookiePair: csrfCookie, csrfToken } = primeCsrfCookie()
    const gateLogin = createMockResponse()
    gateLoginHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: csrfCookie, 'x-csrf-token': csrfToken },
        body: { accessKey: 'test-access-key' },
      }),
      gateLogin.res,
    )
    const gateCookie = extractCookiePair(gateLogin.state.headers['Set-Cookie'], 'th_prelaunch_gate')

    const authLogin = createMockResponse()
    authLoginHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: `${csrfCookie}; ${gateCookie}`, 'x-csrf-token': csrfToken },
        body: { username: 'owner', password: 'change-me-owner-password' },
      }),
      authLogin.res,
    )

    const authCookie = extractCookiePair(authLogin.state.headers['Set-Cookie'], 'th_prelaunch_session')
    const refreshedCsrfCookie = extractCookiePair(authLogin.state.headers['Set-Cookie'], 'th_csrf')

    return {
      authCookie,
      gateCookie,
      csrfCookie: refreshedCsrfCookie,
      csrfToken: extractCsrfTokenFromCookie(refreshedCsrfCookie),
    }
  }

  it('reads the current profile through the profile API and creates a default server record', async () => {
    const { authCookie, gateCookie, csrfCookie } = createAuthenticatedCookies()
    const response = createMockResponse()

    await profileHandler(
      createMockRequest({
        method: 'GET',
        headers: { cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}` },
      }),
      response.res,
    )

    expect(response.state.statusCode).toBe(200)
    expect(parseJsonBody(response.state.body)).toEqual({
      profile: {
        user_id: 'owner',
        display_name: 'Owner',
        avatar_url: '',
        bio: '',
        role: 'owner',
      },
    })
    expect(profileStorage.records.get('owner')).toMatchObject({
      userId: 'owner',
      displayName: 'Owner',
      avatarUrl: '',
      bio: '',
    })
  })

  it('updates the current profile through the API with csrf validation and persists the result', async () => {
    const { authCookie, gateCookie, csrfCookie, csrfToken } = createAuthenticatedCookies()
    const update = createMockResponse()

    await profileHandler(
      createMockRequest({
        method: 'POST',
        headers: {
          cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: {
          display_name: 'Owner Updated',
          avatar_url: 'https://example.com/avatar.png',
          bio: 'Server-backed profile',
        },
      }),
      update.res,
    )

    expect(update.state.statusCode).toBe(200)

    const readBack = createMockResponse()
    await profileHandler(
      createMockRequest({
        method: 'GET',
        headers: { cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}` },
      }),
      readBack.res,
    )

    expect(parseJsonBody(readBack.state.body)).toEqual({
      profile: {
        user_id: 'owner',
        display_name: 'Owner Updated',
        avatar_url: 'https://example.com/avatar.png',
        bio: 'Server-backed profile',
        role: 'owner',
      },
    })
    expect(profileStorage.records.get('owner')).toMatchObject({
      userId: 'owner',
      displayName: 'Owner Updated',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Server-backed profile',
    })
  })

  it('rejects invalid profile updates on the server', async () => {
    const { authCookie, gateCookie, csrfCookie, csrfToken } = createAuthenticatedCookies()
    const response = createMockResponse()

    await profileHandler(
      createMockRequest({
        method: 'POST',
        headers: {
          cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: {
          display_name: 'Owner',
          avatar_url: 'not-a-url',
          bio: '',
        },
      }),
      response.res,
    )

    expect(response.state.statusCode).toBe(400)
    expect(parseJsonBody(response.state.body)).toEqual({
      error: {
        code: 'PROFILE_INVALID',
        message: 'avatar_url must be a valid absolute URL',
      },
    })
  })

  it('uses cached profile data as explicit read fallback when the profile API is unavailable', async () => {
    const cacheStore = createMemoryCacheStore()
    const service = new ProfileService(
      {
        getCurrentProfile: vi
          .fn()
          .mockResolvedValueOnce({
            user_id: 'owner',
            display_name: 'Cached Owner',
            avatar_url: '',
            bio: 'cached',
            role: 'owner',
          } satisfies UserProfileView)
          .mockRejectedValueOnce(new ProfileServiceError('Profile service is unavailable')),
        updateCurrentProfile: vi.fn(),
      },
      cacheStore,
    )

    const firstRead = await service.getCurrentProfile('owner')
    const fallbackRead = await service.getCurrentProfile('owner')

    expect(firstRead.display_name).toBe('Cached Owner')
    expect(fallbackRead.bio).toBe('cached')
  })

  it('keeps update failures explicit instead of silently writing fallback profile data', async () => {
    const service = new ProfileService(
      {
        getCurrentProfile: vi.fn(),
        updateCurrentProfile: vi.fn().mockRejectedValue(new ProfileServiceError('Profile service is unavailable')),
      },
      createMemoryCacheStore(),
    )

    await expect(
      service.updateCurrentProfile('owner', {
        display_name: 'Owner',
        avatar_url: '',
        bio: '',
      }),
    ).rejects.toBeInstanceOf(ProfileServiceError)
  })

  it('surfaces profile validation errors from the client service', async () => {
    const service = new ProfileService(
      {
        getCurrentProfile: vi.fn(),
        updateCurrentProfile: vi.fn(),
      },
      createMemoryCacheStore(),
    )

    await expect(
      service.updateCurrentProfile('owner', {
        display_name: 'Owner',
        avatar_url: 'invalid-url',
        bio: '',
      }),
    ).rejects.toBeInstanceOf(ProfileValidationError)
  })
})

describe('FileProfileStorage', () => {
  it('persists profiles in the legacy JSON file format', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'triggerhub-profile-storage-'))
    const storePath = path.join(tempDir, 'profiles.json')
    const storage = new FileProfileStorage({ storePath })
    const now = Date.now()

    try {
      await storage.saveProfile({
        userId: 'owner',
        displayName: 'Owner',
        avatarUrl: '',
        bio: 'Persisted',
        createdAt: now,
        updatedAt: now,
      })

      expect(await storage.getProfile('owner')).toEqual({
        userId: 'owner',
        displayName: 'Owner',
        avatarUrl: '',
        bio: 'Persisted',
        createdAt: now,
        updatedAt: now,
      })

      expect(JSON.parse(await readFile(storePath, 'utf8'))).toEqual([
        {
          userId: 'owner',
          displayName: 'Owner',
          avatarUrl: '',
          bio: 'Persisted',
          createdAt: now,
          updatedAt: now,
        },
      ])
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })
})
