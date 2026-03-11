import { describe, expect, it } from 'vitest'
import { hashPasswordPbkdf2, verifyPasswordHash } from '../../website/src/modules/auth/passwordHashing'
import { AuthError, AuthService } from '../../website/src/modules/auth/authService'
import { OwnerAuthProvider } from '../../website/src/modules/auth/ownerAuthProvider'
import type { AuthConfig, AuthIdentityProvider, AuthSession, SessionStore } from '../../website/src/modules/auth/types'
import { evaluateRouteAccess } from '../../website/src/modules/access-control/policy'
import { getResolvedRoutePolicy } from '../../website/src/app/routing/routeManifest'
import { resolveRuntimeConfig } from '../../website/src/config/runtimeConfig'
import { getSystemRedirectForRoute, normalizeRoutePath } from '../../website/src/app/routing/AppRouter'

const createMemorySessionStore = (): SessionStore => {
  let state: AuthSession | null = null
  return {
    read: () => state,
    write: (session) => {
      state = session
    },
    clear: () => {
      state = null
    },
  }
}

describe('website auth v1', () => {
  it('hashes and verifies passwords with PBKDF2', async () => {
    const password = 'owner-secret'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = await hashPasswordPbkdf2(password, salt, iterations)

    await expect(verifyPasswordHash(password, hash, salt, iterations)).resolves.toBe(true)
    await expect(verifyPasswordHash('wrong-password', hash, salt, iterations)).resolves.toBe(false)
  })

  it('creates and hydrates an owner session on login', async () => {
    const password = 'change-me-owner-password'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = await hashPasswordPbkdf2(password, salt, iterations)

    const config: AuthConfig = {
      sessionTtlMs: 60_000,
    }

    const authService = new AuthService(
      config,
      createMemorySessionStore(),
      new OwnerAuthProvider({
        userId: 'owner',
        email: 'owner@example.com',
        username: 'owner',
        passwordHashBase64: hash,
        saltBase64: salt,
        iterations,
      }),
    )
    const session = await authService.login({ username: 'owner', password })

    expect(session.userId).toBe('owner')
    expect(session.role).toBe('owner')
    expect(authService.hydrateSession()).toEqual(session)
  })

  it('rejects invalid credentials', async () => {
    const config: AuthConfig = {
      sessionTtlMs: 60_000,
    }

    const authService = new AuthService(
      config,
      createMemorySessionStore(),
      new OwnerAuthProvider({
        userId: 'owner',
        email: 'owner@example.com',
        username: 'owner',
        passwordHashBase64: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=',
        saltBase64: 'Qts5VOgjtGlONEso+UKmCw==',
        iterations: 210000,
      }),
    )
    await expect(authService.login({ username: 'owner', password: 'invalid' })).rejects.toBeInstanceOf(
      AuthError,
    )
  })

  it('rejects tampered persisted sessions with mismatched role', async () => {
    const password = 'change-me-owner-password'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = await hashPasswordPbkdf2(password, salt, iterations)

    const config: AuthConfig = {
      sessionTtlMs: 60_000,
    }

    const tamperedStore: SessionStore = {
      read: () => ({
        sessionId: '0123456789abcdef0123456789abcdef',
        guardId: '0123456789abcdef0123456789abcdef',
        userId: 'owner',
        role: 'user',
        email: 'owner@example.com',
        createdAt: Date.now(),
        expiresAt: Date.now() + 10_000,
      }),
      write: () => {},
      clear: () => {},
    }

    const authService = new AuthService(
      config,
      tamperedStore,
      new OwnerAuthProvider({
        userId: 'owner',
        email: 'owner@example.com',
        username: 'owner',
        passwordHashBase64: hash,
        saltBase64: salt,
        iterations,
      }),
    )
    expect(authService.hydrateSession()).toBeNull()
  })

  it('uses identity returned by provider instead of hardcoded owner identity', async () => {
    const config: AuthConfig = {
      sessionTtlMs: 60_000,
    }

    const provider: AuthIdentityProvider = {
      authenticate: async () => ({
        userId: 'integration-user',
        role: 'user',
        email: 'user@example.com',
      }),
      isSessionIdentityValid: (identity) => identity.userId === 'integration-user',
    }

    const authService = new AuthService(config, createMemorySessionStore(), provider)
    const session = await authService.login({ username: 'any', password: 'any' })

    expect(session.userId).toBe('integration-user')
    expect(session.role).toBe('user')
    expect(session.email).toBe('user@example.com')
  })
})

describe('owner auth provider adapter', () => {
  it('authenticates and returns owner identity from env-like config', async () => {
    const password = 'change-me-owner-password'
    const salt = 'Qts5VOgjtGlONEso+UKmCw=='
    const iterations = 210000
    const hash = await hashPasswordPbkdf2(password, salt, iterations)

    const provider = new OwnerAuthProvider({
      userId: 'owner',
      email: 'owner@example.com',
      username: 'owner',
      passwordHashBase64: hash,
      saltBase64: salt,
      iterations,
    })

    const identity = await provider.authenticate({ username: 'owner', password })
    expect(identity.userId).toBe('owner')
    expect(identity.role).toBe('owner')
    expect(identity.email).toBe('owner@example.com')
  })

  it('validates persisted identity against configured owner', () => {
    const provider = new OwnerAuthProvider({
      userId: 'owner',
      email: 'owner@example.com',
      username: 'owner',
      passwordHashBase64: 'unused',
      saltBase64: 'unused',
      iterations: 210000,
    })

    expect(
      provider.isSessionIdentityValid({
        userId: 'owner',
        role: 'owner',
        email: 'owner@example.com',
      }),
    ).toBe(true)
    expect(
      provider.isSessionIdentityValid({
        userId: 'owner',
        role: 'user',
        email: 'owner@example.com',
      }),
    ).toBe(false)
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
    const policy = { visibility: 'protected' as const, ownerOnly: true }
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

  it('resolves mode-specific policy for root route', () => {
    const privatePolicy = getResolvedRoutePolicy('/', 'private_prelaunch')
    const publicPolicy = getResolvedRoutePolicy('/', 'public_product', { signupEnabled: true })

    expect(privatePolicy.visibility).toBe('protected')
    expect(privatePolicy.ownerOnly).toBe(true)
    expect(publicPolicy.visibility).toBe('public')
  })

  it('keeps app routes protected in public product mode', () => {
    const appPolicy = getResolvedRoutePolicy('/app', 'public_product', { signupEnabled: true })
    const dashboardPolicy = getResolvedRoutePolicy('/dashboard', 'public_product', { signupEnabled: true })
    const profilePolicy = getResolvedRoutePolicy('/profile', 'public_product', { signupEnabled: true })
    const settingsPolicy = getResolvedRoutePolicy('/settings', 'public_product', { signupEnabled: true })

    expect(appPolicy.visibility).toBe('protected')
    expect(dashboardPolicy.visibility).toBe('protected')
    expect(profilePolicy.visibility).toBe('protected')
    expect(settingsPolicy.visibility).toBe('protected')
    expect(profilePolicy.ownerOnly).toBe(false)
  })

  it('keeps marketing pages protected in private prelaunch mode', () => {
    const featuresPolicy = getResolvedRoutePolicy('/features', 'private_prelaunch', { signupEnabled: true })
    const pricingPolicy = getResolvedRoutePolicy('/pricing', 'private_prelaunch', { signupEnabled: true })
    const aboutPolicy = getResolvedRoutePolicy('/about', 'private_prelaunch', { signupEnabled: true })

    expect(featuresPolicy.visibility).toBe('protected')
    expect(pricingPolicy.visibility).toBe('protected')
    expect(aboutPolicy.visibility).toBe('protected')
    expect(featuresPolicy.ownerOnly).toBe(true)
  })

  it('blocks signup policy-side when signup feature is disabled', () => {
    const signupPolicy = getResolvedRoutePolicy('/signup', 'public_product', { signupEnabled: false })
    const decision = evaluateRouteAccess(signupPolicy, { mode: 'public_product', identity: null }, '/signup')

    expect(decision.allow).toBe(false)
    expect(decision.reason).toBe('mode_blocked')
  })
})

describe('website runtime config hardening', () => {
  it('fails closed when owner config is missing', () => {
    const runtime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'private_prelaunch',
        VITE_ENABLE_SIGNUP: 'false',
      },
      { isDev: false },
    )

    expect(runtime.authConfig).toBeNull()
    expect(runtime.ownerProviderConfig).toBeNull()
    expect(runtime.ownerAuthConfigStatus.configured).toBe(false)
    expect(runtime.ownerAuthConfigStatus.reasons.length).toBeGreaterThan(0)
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
})
