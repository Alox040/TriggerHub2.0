import type { AccessMode, RoutePolicy } from '../../modules/access-control/types'

export type RoutePath =
  | '/access'
  | '/'
  | '/features'
  | '/pricing'
  | '/about'
  | '/impressum'
  | '/datenschutz'
  | '/login'
  | '/signup'
  | '/app'
  | '/dashboard'
  | '/profile'
  | '/settings'
  | '/forbidden'
  | '/logout'
  | '/internal'
  | '/imprint'
  | '/privacy'

type RouteGroup = 'public_marketing' | 'public_auth' | 'protected_product' | 'system'

export interface RouteDefinition {
  path: RoutePath
  group: RouteGroup
  basePolicy: RoutePolicy
  systemRedirectTo?: RoutePath
  modeOverrides?: Partial<Record<AccessMode, RoutePolicy>>
}

export const KNOWN_ROUTE_PATHS: ReadonlySet<RoutePath> = new Set<RoutePath>([
  '/access',
  '/',
  '/features',
  '/pricing',
  '/about',
  '/impressum',
  '/datenschutz',
  '/login',
  '/signup',
  '/app',
  '/dashboard',
  '/profile',
  '/settings',
  '/forbidden',
  '/logout',
  '/internal',
  '/imprint',
  '/privacy',
])

const publicRoute = (policy: RoutePolicy = { visibility: 'public' }): RoutePolicy => policy
const protectedRoute = (policy: RoutePolicy = { visibility: 'protected' }): RoutePolicy => policy
const ownerOnlyRoute = (): RoutePolicy => ({
  visibility: 'protected',
  ownerOnly: true,
  allowedRoles: ['owner'],
})

const ROUTE_MANIFEST: Record<RoutePath, RouteDefinition> = {
  '/access': {
    path: '/access',
    group: 'system',
    basePolicy: publicRoute(),
    systemRedirectTo: '/',
  },
  '/': {
    path: '/',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/features': {
    path: '/features',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/pricing': {
    path: '/pricing',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/about': {
    path: '/about',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/impressum': {
    path: '/impressum',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    systemRedirectTo: '/imprint',
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/datenschutz': {
    path: '/datenschutz',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    systemRedirectTo: '/privacy',
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/login': {
    path: '/login',
    group: 'public_auth',
    basePolicy: publicRoute(),
  },
  '/signup': {
    path: '/signup',
    group: 'system',
    basePolicy: publicRoute(),
    systemRedirectTo: '/login',
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/app': {
    path: '/app',
    group: 'protected_product',
    basePolicy: protectedRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/dashboard': {
    path: '/dashboard',
    group: 'protected_product',
    basePolicy: protectedRoute(),
    modeOverrides: {
      invite_only: {
        visibility: 'protected',
        ownerOnly: false,
      },
      private_prelaunch: ownerOnlyRoute(),
      public_product: {
        visibility: 'protected',
        ownerOnly: false,
      },
    },
  },
  '/profile': {
    path: '/profile',
    group: 'protected_product',
    basePolicy: protectedRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
      invite_only: {
        visibility: 'protected',
        ownerOnly: false,
      },
      public_product: {
        visibility: 'protected',
        ownerOnly: false,
      },
    },
  },
  '/settings': {
    path: '/settings',
    group: 'protected_product',
    basePolicy: protectedRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
      invite_only: {
        visibility: 'protected',
        ownerOnly: false,
      },
      public_product: {
        visibility: 'protected',
        ownerOnly: false,
      },
    },
  },
  '/forbidden': {
    path: '/forbidden',
    group: 'system',
    basePolicy: publicRoute(),
  },
  '/imprint': {
    path: '/imprint',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/privacy': {
    path: '/privacy',
    group: 'public_marketing',
    basePolicy: publicRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/logout': {
    path: '/logout',
    group: 'system',
    basePolicy: protectedRoute(),
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
  '/internal': {
    path: '/internal',
    group: 'system',
    basePolicy: protectedRoute(),
    systemRedirectTo: '/dashboard',
    modeOverrides: {
      private_prelaunch: ownerOnlyRoute(),
    },
  },
}

export const getRouteDefinition = (path: string): RouteDefinition => {
  const knownPath = (path in ROUTE_MANIFEST ? path : '/') as RoutePath
  return ROUTE_MANIFEST[knownPath]
}

export const normalizeRoutePath = (path: string): RoutePath =>
  (KNOWN_ROUTE_PATHS.has(path as RoutePath) ? path : '/') as RoutePath

export const getResolvedRoutePolicy = (
  path: string,
  mode: AccessMode,
): RoutePolicy => {
  const definition = getRouteDefinition(path)
  return definition.modeOverrides?.[mode] ?? definition.basePolicy
}

export const getSystemRedirectForRoute = (path: RoutePath): RoutePath | null =>
  getRouteDefinition(path).systemRedirectTo ?? null
