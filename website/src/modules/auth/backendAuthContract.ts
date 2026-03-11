import type { AuthIdentity, LoginRequest } from './types'

export type BackendAuthErrorCode =
  | 'AUTH_INVALID_REQUEST'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UNAUTHENTICATED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_SESSION_REVOKED'
  | 'AUTH_CSRF_REQUIRED'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_ACCOUNT_LOCKED'

export interface BackendAuthErrorPayload {
  code: BackendAuthErrorCode
  message: string
  retryAfterSeconds?: number
}

export interface BackendSessionSnapshot {
  userId: string
  role: AuthIdentity['role']
  email: string
  displayName?: string
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  sessionVersion: number
}

export interface BackendLoginRequest extends LoginRequest {}

export interface BackendLoginResponse {
  session: BackendSessionSnapshot
}

export interface BackendLogoutResponse {}

export interface BackendAuthMeResponse {
  authenticated: boolean
  session?: BackendSessionSnapshot
  error?: BackendAuthErrorPayload
}

export interface BackendRefreshResponse {
  session: BackendSessionSnapshot
}

export interface BackendAuthApi {
  login(request: BackendLoginRequest): Promise<BackendLoginResponse>
  logout(csrfToken?: string): Promise<void>
  getCurrentSession(): Promise<BackendAuthMeResponse>
  refresh(csrfToken: string): Promise<BackendRefreshResponse>
}

export interface BackendAuthProviderConfig {
  baseUrl?: string
  loginPath?: string
  logoutPath?: string
  mePath?: string
  refreshPath?: string
}
