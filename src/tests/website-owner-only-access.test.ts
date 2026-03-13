import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'node:crypto'
import gateLoginHandler from '../../website/api/prelaunch-gate/login'
import gateMeHandler from '../../website/api/prelaunch-gate/me'
import authLoginHandler from '../../website/api/auth/login'
import authMeHandler from '../../website/api/auth/me'
import authLogoutHandler from '../../website/api/auth/logout'
import { resetInMemorySecurityGuardsForTests } from '../../website/api/_security'
import { evaluateRouteAccess } from '../../website/src/modules/access-control/policy'
import { getResolvedRoutePolicy } from '../../website/src/app/routing/routeManifest'

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

describe('website owner-only access verification', () => {
  const originalEnv = {
    accessMode: process.env.VITE_ACCESS_MODE,
    enableSignup: process.env.VITE_ENABLE_SIGNUP,
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
  }

  beforeEach(async () => {
    const password = 'change-me-owner-password'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), iterations, 32, 'sha256').toString('base64')

    process.env.VITE_ACCESS_MODE = 'private_prelaunch'
    process.env.VITE_ENABLE_SIGNUP = 'false'
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
    resetInMemorySecurityGuardsForTests()
  })

  afterEach(() => {
    process.env.VITE_ACCESS_MODE = originalEnv.accessMode
    process.env.VITE_ENABLE_SIGNUP = originalEnv.enableSignup
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
    resetInMemorySecurityGuardsForTests()
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

  it('blocks auth session checks without the prelaunch gate', () => {
    const { res, state } = createMockResponse()
    authMeHandler(createMockRequest({ method: 'GET' }), res)

    expect(state.statusCode).toBe(403)
    expect(parseJsonBody(state.body)).toMatchObject({
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_REQUIRED' },
    })
  })

  it('rejects the wrong prelaunch access key', () => {
    const { cookiePair, csrfToken } = primeCsrfCookie()
    const { res, state } = createMockResponse()
    gateLoginHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: cookiePair, 'x-csrf-token': csrfToken },
        body: { accessKey: 'wrong-key' },
      }),
      res,
    )

    expect(state.statusCode).toBe(401)
    expect(parseJsonBody(state.body)).toMatchObject({
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_INVALID_KEY' },
    })
  })

  it('rate-limits repeated prelaunch gate login attempts', () => {
    const { cookiePair, csrfToken } = primeCsrfCookie()
    const clientHeaders = { 'x-forwarded-for': '198.51.100.10', 'user-agent': 'vitest' }
    let lastState: MockResponse | null = null

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const { res, state } = createMockResponse()
      gateLoginHandler(
        createMockRequest({
          method: 'POST',
          headers: { ...clientHeaders, cookie: cookiePair, 'x-csrf-token': csrfToken },
          body: { accessKey: 'wrong-key' },
        }),
        res,
      )
      lastState = state
    }

    expect(lastState?.statusCode).toBe(429)
    expect(lastState?.headers['Retry-After']).toBeTruthy()
    expect(parseJsonBody(lastState?.body ?? '')).toMatchObject({
      error: {
        code: 'AUTH_RATE_LIMITED',
      },
    })
  })

  it('allows the correct prelaunch access key and owner login', () => {
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

    expect(gateLogin.state.statusCode).toBe(200)
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

    expect(authLogin.state.statusCode).toBe(200)
    expect(parseJsonBody(authLogin.state.body)).toMatchObject({
      session: { userId: 'owner', role: 'owner', email: 'owner@example.com' },
    })
    expect(extractCookiePair(authLogin.state.headers['Set-Cookie'], 'th_prelaunch_session')).toContain('.')
    expect(extractCookiePair(authLogin.state.headers['Set-Cookie'], 'th_csrf')).toContain('th_csrf=')
  })

  it('rejects wrong owner credentials even after the gate is open', () => {
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
        body: { username: 'owner', password: 'wrong-password' },
      }),
      authLogin.res,
    )

    expect(authLogin.state.statusCode).toBe(401)
    expect(parseJsonBody(authLogin.state.body)).toMatchObject({
      error: { code: 'AUTH_INVALID_CREDENTIALS' },
    })
  })

  it('rate-limits repeated owner login attempts', () => {
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
    const clientHeaders = {
      cookie: `${csrfCookie}; ${gateCookie}`,
      'x-csrf-token': csrfToken,
      'x-forwarded-for': '198.51.100.11',
      'user-agent': 'vitest',
    }

    let lastState: MockResponse | null = null
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const authLogin = createMockResponse()
      authLoginHandler(
        createMockRequest({
          method: 'POST',
          headers: clientHeaders,
          body: { username: 'owner', password: 'wrong-password' },
        }),
        authLogin.res,
      )
      lastState = authLogin.state
    }

    expect(lastState?.statusCode).toBe(429)
    expect(lastState?.headers['Retry-After']).toBeTruthy()
    expect(parseJsonBody(lastState?.body ?? '')).toMatchObject({
      error: {
        code: 'AUTH_RATE_LIMITED',
      },
    })
  })

  it('security logging does not include plaintext credentials', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const secretAccessKey = 'my-very-secret-access-key'
    const secretPassword = 'my-very-secret-password'
    const { cookiePair: csrfCookie, csrfToken } = primeCsrfCookie()

    const gateAttempt = createMockResponse()
    gateLoginHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: csrfCookie, 'x-csrf-token': csrfToken },
        body: { accessKey: secretAccessKey },
      }),
      gateAttempt.res,
    )

    const authAttempt = createMockResponse()
    authLoginHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: csrfCookie, 'x-csrf-token': csrfToken },
        body: { username: 'owner', password: secretPassword },
      }),
      authAttempt.res,
    )

    const serializedLogs = warnSpy.mock.calls.map((entry) => String(entry[0] ?? '')).join('\n')
    expect(serializedLogs).not.toContain(secretAccessKey)
    expect(serializedLogs).not.toContain(secretPassword)
  })

  it('treats direct protected routes as inaccessible without authenticated owner identity', () => {
    const dashboardPolicy = getResolvedRoutePolicy('/dashboard', 'private_prelaunch', { signupEnabled: false })
    const unauthenticated = evaluateRouteAccess(dashboardPolicy, { mode: 'private_prelaunch', identity: null }, '/dashboard')
    const nonOwner = evaluateRouteAccess(
      dashboardPolicy,
      {
        mode: 'private_prelaunch',
        identity: { userId: 'user-1', role: 'user', email: 'user@example.com' },
      },
      '/dashboard',
    )
    const owner = evaluateRouteAccess(
      dashboardPolicy,
      {
        mode: 'private_prelaunch',
        identity: { userId: 'owner', role: 'owner', email: 'owner@example.com' },
      },
      '/dashboard',
    )

    expect(unauthenticated).toMatchObject({ allow: false, reason: 'unauthenticated' })
    expect(nonOwner).toMatchObject({ allow: false, reason: 'insufficient_role' })
    expect(owner).toMatchObject({ allow: true })
  })

  it('returns owner session on reload only when gate cookie and owner session cookie are both present', () => {
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

    const meWithBothCookies = createMockResponse()
    authMeHandler(
      createMockRequest({
        method: 'GET',
        headers: { cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}` },
      }),
      meWithBothCookies.res,
    )

    const meWithoutOwnerSession = createMockResponse()
    authMeHandler(
      createMockRequest({
        method: 'GET',
        headers: { cookie: `${csrfCookie}; ${gateCookie}` },
      }),
      meWithoutOwnerSession.res,
    )

    expect(meWithBothCookies.state.statusCode).toBe(200)
    expect(parseJsonBody(meWithBothCookies.state.body)).toMatchObject({
      authenticated: true,
      session: { userId: 'owner', role: 'owner' },
    })
    expect(meWithoutOwnerSession.state.statusCode).toBe(401)
  })

  it('clears owner session on logout and subsequent reload is unauthenticated', () => {
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

    const logout = createMockResponse()
    authLogoutHandler(
      createMockRequest({
        method: 'POST',
        headers: { cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}`, 'x-csrf-token': csrfToken },
      }),
      logout.res,
    )

    expect(logout.state.statusCode).toBe(200)
    expect(extractCookiePair(logout.state.headers['Set-Cookie'], 'th_prelaunch_session')).toContain('th_prelaunch_session=')
    expect(getSetCookieValues(logout.state.headers['Set-Cookie']).join(';')).toContain('Max-Age=0')

    const meAfterLogout = createMockResponse()
    authMeHandler(
      createMockRequest({
        method: 'GET',
        headers: { cookie: `${csrfCookie}; ${gateCookie}` },
      }),
      meAfterLogout.res,
    )

    expect(meAfterLogout.state.statusCode).toBe(401)
  })

  it('applies security headers and requires csrf for mutating auth endpoints', () => {
    const gateStatus = createMockResponse()
    gateMeHandler(createMockRequest({ method: 'GET' }), gateStatus.res)

    expect(gateStatus.state.headers['Content-Security-Policy']).toContain("default-src 'none'")
    expect(gateStatus.state.headers['X-Frame-Options']).toBe('DENY')

    const gateAttempt = createMockResponse()
    gateLoginHandler(
      createMockRequest({
        method: 'POST',
        body: { accessKey: 'test-access-key' },
      }),
      gateAttempt.res,
    )

    expect(gateAttempt.state.statusCode).toBe(403)
    expect(parseJsonBody(gateAttempt.state.body)).toMatchObject({
      error: { code: 'AUTH_CSRF_REQUIRED' },
    })
  })
})
