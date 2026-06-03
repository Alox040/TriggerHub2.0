import type { UserRole } from '../access-control/types'

export interface AuthSession {
  sessionId: string
  guardId: string
  userId: string
  role: UserRole
  email: string
  identityCreatedAt?: number
  createdAt: number
  expiresAt: number
}

export interface AuthIdentity {
  userId: string
  role: UserRole
  email: string
  createdAt?: number
}

export interface OwnerCredentialConfig {
  userId: string
  email: string
  username: string
  passwordHashBase64: string
  saltBase64: string
  iterations: number
}

export interface AuthConfig {
  sessionTtlMs: number
}

export interface OwnerAuthConfigStatus {
  configured: boolean
  reasons: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SessionStore {
  read(): AuthSession | null
  write(session: AuthSession): void
  clear(): void
}

export interface AuthPort {
  getSession(): AuthSession | null
  login(request: LoginRequest): Promise<AuthSession>
  logout(): void
  hydrateSession(): AuthSession | null
}

export interface AuthIdentityProvider {
  authenticate(request: LoginRequest): Promise<AuthIdentity>
  isSessionIdentityValid(identity: AuthIdentity): boolean
}
