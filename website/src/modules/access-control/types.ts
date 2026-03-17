export const ACCESS_MODES = ['private_prelaunch', 'invite_only', 'public_product'] as const

export type AccessMode = (typeof ACCESS_MODES)[number]

export const DEFAULT_ACCESS_MODE: AccessMode = 'public_product'
export const ACTIVE_ACCESS_MODES: readonly AccessMode[] = ['invite_only', 'public_product']
export const FUTURE_PUBLIC_ACCESS_MODES: readonly AccessMode[] = []

export const isAccessMode = (value: string | undefined): value is AccessMode =>
  typeof value === 'string' && (ACCESS_MODES as readonly string[]).includes(value)

export type UserRole = 'owner' | 'user'

export interface AuthIdentity {
  userId: string
  role: UserRole
  email: string
  createdAt?: number
}

export interface RoutePolicy {
  visibility: 'public' | 'protected'
  ownerOnly?: boolean
  allowedRoles?: ReadonlyArray<UserRole>
  allowInModes?: AccessMode[]
}

export interface AccessDecision {
  allow: boolean
  redirectTo?: string
  reason?: 'unauthenticated' | 'insufficient_role' | 'mode_blocked'
}
