export type AccessMode = 'private_prelaunch' | 'invite_only' | 'public_product'

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
  allowInModes?: AccessMode[]
}

export interface AccessDecision {
  allow: boolean
  redirectTo?: string
  reason?: 'unauthenticated' | 'insufficient_role' | 'mode_blocked'
}
