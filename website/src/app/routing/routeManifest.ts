import type { AccessMode, RoutePolicy } from '../../modules/access-control/types'

export type RoutePath =
  | '/'
  | '/features'
  | '/pricing'
  | '/about'
  // Company website routes
  | '/resqbrain'
  | '/kontakt'
  | '/impressum'
  | '/datenschutz'
  | '/imprint'
  | '/privacy'
  // Auth + product
  | '/login'
  | '/signup'
  | '/app'
  | '/dashboard'
  | '/profile'
  | '/settings'
  | '/forbidden'
  | '/logout'
  | '/internal'

type RouteGroup = 'public_marketing' | 'public_auth' | 'protected_product' | 'system'

export interface RouteDefinition {
  path: RoutePath
  group: RouteGroup
  basePolicy: RoutePolicy
  modeOverrides?: Partial<Record<AccessMode, RoutePolicy>>
}

const ROUTE_MANIFEST: Record<RoutePath, RouteDefinition> = {
  '/': {
    path: '/',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/resqbrain': {
    path: '/resqbrain',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/kontakt': {
    path: '/kontakt',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/impressum': {
    path: '/impressum',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
  },
  '/datenschutz': {
    path: '/datenschutz',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
  },
  '/imprint': {
    path: '/imprint',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
  },
  '/privacy': {
    path: '/privacy',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
  },
  '/features': {
    path: '/features',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/pricing': {
    path: '/pricing',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/about': {
    path: '/about',
    group: 'public_marketing',
    basePolicy: { visibility: 'public' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/login': {
    path: '/login',
    group: 'public_auth',
    basePolicy: { visibility: 'public' },
  },
  '/signup': {
    path: '/signup',
    group: 'public_auth',
    basePolicy: {
      visibility: 'public',
      allowInModes: ['invite_only', 'public_product'],
    },
  },
  '/app': {
    path: '/app',
    group: 'protected_product',
    basePolicy: { visibility: 'protected' },
    modeOverrides: {
      private_prelaunch: { visibility: 'protected', ownerOnly: true },
    },
  },
  '/dashboard': {
    path: '/dashboard',
    group: 'protected_product',
    basePolicy: { visibility: 'protected' },
    modeOverrides: {
      invite_only: {
        visibility: 'protected',
        ownerOnly: false,
      },
      private_prelaunch: {
        visibility: 'protected',
        ownerOnly: true,
      },
      public_product: {
        visibility: 'protected',
        ownerOnly: false,
      },
    },
  },
  '/profile': {
    path: '/profile',
    group: 'protected_product',
    basePolicy: { visibility: 'protected' },
    modeOverrides: {
      private_prelaunch: {
        visibility: 'protected',
        ownerOnly: true,
      },
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
    basePolicy: { visibility: 'protected' },
    modeOverrides: {
      private_prelaunch: {
        visibility: 'protected',
        ownerOnly: true,
      },
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
    basePolicy: { visibility: 'public' },
  },
  '/logout': {
    path: '/logout',
    group: 'system',
    basePolicy: { visibility: 'protected' },
  },
  '/internal': {
    path: '/internal',
    group: 'system',
    basePolicy: { visibility: 'protected' },
    modeOverrides: {
      private_prelaunch: {
        visibility: 'protected',
        ownerOnly: true,
      },
    },
  },
}

export const getRouteDefinition = (path: string): RouteDefinition => {
  const knownPath = (path in ROUTE_MANIFEST ? path : '/') as RoutePath
  return ROUTE_MANIFEST[knownPath]
}

export const getResolvedRoutePolicy = (
  path: string,
  mode: AccessMode,
  options?: { signupEnabled?: boolean },
): RoutePolicy => {
  if (path === '/signup' && options?.signupEnabled === false) {
    return {
      visibility: 'public',
      allowInModes: [],
    }
  }

  const definition = getRouteDefinition(path)
  return definition.modeOverrides?.[mode] ?? definition.basePolicy
}
