import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import crypto from 'node:crypto'
import gateLoginHandler from '../../website/api/prelaunch-gate/login'
import gateMeHandler from '../../website/api/prelaunch-gate/me'
import authLoginHandler from '../../website/api/auth/login'
import authMeHandler from '../../website/api/auth/me'
import authLogoutHandler from '../../website/api/auth/logout'
import { resetInMemorySecurityGuardsForTests } from '../../website/api/_security'
import { createServerBackedSession } from '../../website/src/modules/auth/backendSession'
import { evaluateRouteAccess } from '../../website/src/modules/access-control/policy'
import {
  getResolvedRoutePolicy,
  getSystemRedirectForRoute,
  normalizeRoutePath,
} from '../../website/src/app/routing/routeManifest'
import { resolveRuntimeConfig } from '../../website/src/config/runtimeConfig'
import {
  ACTIVE_ACCESS_MODES,
  DEFAULT_ACCESS_MODE,
  FUTURE_PUBLIC_ACCESS_MODES,
  isAccessMode,
} from '../../website/src/modules/access-control/types'

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

describe('website auth v1', () => {
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
  }

  beforeEach(() => {
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
    resetInMemorySecurityGuardsForTests()
  })

  afterEach(() => {
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
    resetInMemorySecurityGuardsForTests()
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

  const createAuthenticatedCookies = (): { authCookie: string; csrfCookie: string; gateCookie: string; csrfToken: string } => {
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
      csrfCookie: refreshedCsrfCookie,
      gateCookie,
      csrfToken: extractCsrfTokenFromCookie(refreshedCsrfCookie),
    }
  }

  it('rejects non-owner backend sessions in owner-only prelaunch mode', () => {
    expect(() =>
      createServerBackedSession({
        userId: 'user-1',
        role: 'user',
        email: 'user@example.com',
        issuedAt: '2026-03-11T00:00:00.000Z',
        expiresAt: '2026-03-11T01:00:00.000Z',
        lastAuthenticatedAt: '2026-03-11T00:00:00.000Z',
        sessionVersion: 1,
      }),
    ).toThrow('Backend session snapshot is invalid for owner-only prelaunch mode')
  })

  it('accepts valid owner backend sessions', () => {
    const session = createServerBackedSession({
      userId: 'owner',
      role: 'owner',
      email: 'owner@example.com',
      issuedAt: '2026-03-11T00:00:00.000Z',
      expiresAt: '2026-03-11T01:00:00.000Z',
      lastAuthenticatedAt: '2026-03-11T00:00:00.000Z',
      sessionVersion: 1,
    })

    expect(session.userId).toBe('owner')
    expect(session.role).toBe('owner')
    expect(session.expiresAt).toBeGreaterThan(session.createdAt)
  })

  it('rate-limits rapid-fire auth session reads', () => {
    const { authCookie, csrfCookie, gateCookie } = createAuthenticatedCookies()
    const headers = {
      cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}`,
      'x-forwarded-for': '198.51.100.42',
      'user-agent': 'vitest',
    }

    let lastState: MockResponse | null = null
    for (let attempt = 0; attempt < 61; attempt += 1) {
      const response = createMockResponse()
      authMeHandler(
        createMockRequest({
          method: 'GET',
          headers,
        }),
        response.res,
      )
      lastState = response.state
    }

    expect(lastState?.statusCode).toBe(429)
    expect(lastState?.headers['Retry-After']).toBeTruthy()
    expect(parseJsonBody(lastState?.body ?? '')).toMatchObject({
      error: {
        code: 'AUTH_RATE_LIMITED',
      },
    })
  })

  it('rejects logout without a matching csrf token', () => {
    const { authCookie, csrfCookie, gateCookie } = createAuthenticatedCookies()
    const logout = createMockResponse()

    authLogoutHandler(
      createMockRequest({
        method: 'POST',
        headers: {
          cookie: `${csrfCookie}; ${gateCookie}; ${authCookie}`,
        },
      }),
      logout.res,
    )

    expect(logout.state.statusCode).toBe(403)
    expect(parseJsonBody(logout.state.body)).toEqual({
      error: 'CSRF validation failed',
    })
  })
})

describe('website access policy v1', () => {
  it('blocks unauthenticated access to protected routes', () => {
    const policy = { visibility: 'protected' as const, ownerOnly: true }
    const decision = evaluateRouteAccess(policy, { mode: 'private_prelaunch', identity: null }, '/internal')

    expect(decision.allow).toBe(false)
    expect(decision.reason).toBe('unauthenticated')
    expect(decision.redirectTo).toContain('/login')
  })

  it('allows owner on protected routes', () => {
    const policy = { visibility: 'protected' as const, ownerOnly: true, allowedRoles: ['owner'] as const }
    const decision = evaluateRouteAccess(
      policy,
      {
        mode: 'private_prelaunch',
        identity: { userId: 'owner', role: 'owner', email: 'owner@example.com' },
      },
      '/internal',
    )

    expect(decision.allow).toBe(true)
  })

  it('supports role-based route policies explicitly', () => {
    const policy = { visibility: 'protected' as const, allowedRoles: ['owner'] as const }
    const decision = evaluateRouteAccess(
      policy,
      {
        mode: 'private_prelaunch',
        identity: { userId: 'user-1', role: 'user', email: 'user@example.com' },
      },
      '/internal',
    )

    expect(decision.allow).toBe(false)
    expect(decision.reason).toBe('insufficient_role')
  })

  it('resolves mode-specific policy for root route', () => {
    const privatePolicy = getResolvedRoutePolicy('/', 'private_prelaunch')
    const publicPolicy = getResolvedRoutePolicy('/', 'public_product')

    expect(privatePolicy.visibility).toBe('protected')
    expect(privatePolicy.ownerOnly).toBe(true)
    expect(publicPolicy.visibility).toBe('public')
  })

  it('keeps app routes protected in public product mode', () => {
    const appPolicy = getResolvedRoutePolicy('/app', 'public_product')
    const dashboardPolicy = getResolvedRoutePolicy('/dashboard', 'public_product')
    const profilePolicy = getResolvedRoutePolicy('/profile', 'public_product')
    const settingsPolicy = getResolvedRoutePolicy('/settings', 'public_product')

    expect(appPolicy.visibility).toBe('protected')
    expect(dashboardPolicy.visibility).toBe('protected')
    expect(profilePolicy.visibility).toBe('protected')
    expect(settingsPolicy.visibility).toBe('protected')
    expect(profilePolicy.ownerOnly).toBe(false)
  })

  it('keeps marketing pages protected in private prelaunch mode', () => {
    const featuresPolicy = getResolvedRoutePolicy('/features', 'private_prelaunch')
    const pricingPolicy = getResolvedRoutePolicy('/pricing', 'private_prelaunch')
    const aboutPolicy = getResolvedRoutePolicy('/about', 'private_prelaunch')

    expect(featuresPolicy.visibility).toBe('protected')
    expect(pricingPolicy.visibility).toBe('protected')
    expect(aboutPolicy.visibility).toBe('protected')
    expect(featuresPolicy.ownerOnly).toBe(true)
  })

  it('limits public routes in private prelaunch to login and forbidden only', () => {
    const privatePrelaunchPaths = [
      '/',
      '/features',
      '/pricing',
      '/about',
      '/login',
      '/signup',
      '/app',
      '/dashboard',
      '/profile',
      '/settings',
      '/forbidden',
      '/logout',
      '/internal',
    ] as const

    const publicPaths = privatePrelaunchPaths.filter((path) => {
      const policy = getResolvedRoutePolicy(path, 'private_prelaunch')
      return policy.visibility === 'public'
    })

    expect(publicPaths).toEqual(['/login', '/forbidden'])
  })

  it('keeps legacy signup path owner-only in private prelaunch until router redirects it away', () => {
    const signupPolicy = getResolvedRoutePolicy('/signup', 'private_prelaunch')

    expect(signupPolicy.visibility).toBe('protected')
    expect(signupPolicy.ownerOnly).toBe(true)
  })

  it('treats legacy signup path as public outside prelaunch so the router can redirect it to login', () => {
    const signupPolicy = getResolvedRoutePolicy('/signup', 'public_product')

    expect(signupPolicy.visibility).toBe('public')
  })
})

describe('website runtime config hardening', () => {
  it('keeps client runtime free of owner credential requirements', () => {
    const runtime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'private_prelaunch',
        VITE_SESSION_TTL_MS: '28800000',
      },
      { isDev: false },
    )

    expect(runtime.appAccessMode).toBe('private_prelaunch')
  })

  it('locks the active website mode to private_prelaunch', () => {
    const inviteRuntime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'invite_only',
      },
      { isDev: false },
    )
    const publicRuntime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'public_product',
      },
      { isDev: false },
    )

    expect(inviteRuntime.appAccessMode).toBe('private_prelaunch')
    expect(publicRuntime.appAccessMode).toBe('private_prelaunch')
  })

  it('ignores removed signup env and resolves access mode from the active whitelist', () => {
    const runtime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'private_prelaunch',
        VITE_ENABLE_SIGNUP: 'true',
      },
      { isDev: false },
    )

    expect(runtime.appAccessMode).toBe('private_prelaunch')
  })

  it('keeps future access modes typed even when the active runtime is still prelaunch-only', () => {
    expect(ACTIVE_ACCESS_MODES).toEqual([DEFAULT_ACCESS_MODE])
    expect(FUTURE_PUBLIC_ACCESS_MODES).toEqual(['invite_only', 'public_product'])
    expect(isAccessMode('invite_only')).toBe(true)
    expect(isAccessMode('public_product')).toBe(true)
    expect(isAccessMode('unknown_mode')).toBe(false)
  })
})

describe('router decision helpers', () => {
  it('normalizes unknown paths to root', () => {
    expect(normalizeRoutePath('/unknown-route')).toBe('/')
  })

  it('redirects legacy internal path to dashboard', () => {
    expect(getSystemRedirectForRoute('/internal')).toBe('/dashboard')
    expect(getSystemRedirectForRoute('/dashboard')).toBeNull()
  })

  it('redirects legacy signup path to login', () => {
    expect(getSystemRedirectForRoute('/signup')).toBe('/login')
  })
})
