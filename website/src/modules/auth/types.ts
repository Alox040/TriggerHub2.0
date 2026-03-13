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

export interface PrelaunchOwnerConfig {
  userId: string
  email: string
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
