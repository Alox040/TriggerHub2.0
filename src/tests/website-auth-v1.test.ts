import { describe, expect, it } from 'vitest'
import { createServerBackedSession } from '../../website/src/modules/auth/backendSession'
import { evaluateRouteAccess } from '../../website/src/modules/access-control/policy'
import {
  getResolvedRoutePolicy,
  normalizeRoutePath,
} from '../../website/src/app/routing/routeManifest'
import { resolveRuntimeConfig } from '../../website/src/config/runtimeConfig'
import { getSystemRedirectForRoute } from '../../website/src/app/routing/AppRouter'
import {
  ACTIVE_ACCESS_MODES,
  DEFAULT_ACCESS_MODE,
  FUTURE_PUBLIC_ACCESS_MODES,
  isAccessMode,
} from '../../website/src/modules/access-control/types'

describe('website auth v1', () => {
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
      const policy = getResolvedRoutePolicy(path, 'private_prelaunch', { signupEnabled: false })
      return policy.visibility === 'public'
    })

    expect(publicPaths).toEqual(['/login', '/forbidden'])
  })

  it('blocks signup policy-side when signup feature is disabled', () => {
    const signupPolicy = getResolvedRoutePolicy('/signup', 'public_product', { signupEnabled: false })
    const decision = evaluateRouteAccess(signupPolicy, { mode: 'public_product', identity: null }, '/signup')

    expect(decision.allow).toBe(false)
    expect(decision.reason).toBe('mode_blocked')
  })

  it('treats signup as owner-only in private prelaunch', () => {
    const signupPolicy = getResolvedRoutePolicy('/signup', 'private_prelaunch', { signupEnabled: true })

    expect(signupPolicy.visibility).toBe('protected')
    expect(signupPolicy.ownerOnly).toBe(true)
  })
})

describe('website runtime config hardening', () => {
  it('keeps client runtime free of owner credential requirements', () => {
    const runtime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'private_prelaunch',
        VITE_ENABLE_SIGNUP: 'false',
        VITE_SESSION_TTL_MS: '28800000',
      },
      { isDev: false },
    )

    expect(runtime.appAccessMode).toBe('private_prelaunch')
    expect(runtime.isSignupEnabled).toBe(false)
  })

  it('locks the active website mode to private_prelaunch', () => {
    const inviteRuntime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'invite_only',
        VITE_ENABLE_SIGNUP: 'true',
      },
      { isDev: false },
    )
    const publicRuntime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'public_product',
        VITE_ENABLE_SIGNUP: 'true',
      },
      { isDev: false },
    )

    expect(inviteRuntime.appAccessMode).toBe('private_prelaunch')
    expect(publicRuntime.appAccessMode).toBe('private_prelaunch')
  })

  it('treats missing signup env as disabled by default in the client runtime', () => {
    const runtime = resolveRuntimeConfig(
      {
        VITE_ACCESS_MODE: 'private_prelaunch',
      },
      { isDev: false },
    )

    expect(runtime.isSignupEnabled).toBe(false)
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
})
