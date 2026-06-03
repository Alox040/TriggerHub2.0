import { AuthError } from './authService'
import type { AuthIdentity, AuthIdentityProvider, LoginRequest } from './types'
import type { BackendAuthApi, BackendSessionSnapshot } from './backendAuthContract'

const toAuthIdentity = (session: BackendSessionSnapshot): AuthIdentity => ({
  userId: session.userId,
  role: session.role,
  email: session.email,
  createdAt: Date.parse(session.issuedAt),
})

export class BackendAuthProvider implements AuthIdentityProvider {
  constructor(private readonly api: BackendAuthApi) {}

  async authenticate(request: LoginRequest): Promise<AuthIdentity> {
    const response = await this.api.login(request)
    if (!response.session) {
      throw new AuthError('Backend login response did not include a session snapshot')
    }

    return toAuthIdentity(response.session)
  }

  isSessionIdentityValid(identity: AuthIdentity): boolean {
    return Boolean(identity.userId && identity.email && identity.role)
  }

  async getCurrentIdentity(): Promise<AuthIdentity | null> {
    const response = await this.api.getCurrentSession()

    if (!response.authenticated || !response.session) {
      return null
    }

    return toAuthIdentity(response.session)
  }

  async logout(csrfToken?: string): Promise<void> {
    await this.api.logout(csrfToken)
  }

  async refresh(csrfToken: string): Promise<AuthIdentity> {
    const response = await this.api.refresh(csrfToken)
    if (!response.session) {
      throw new AuthError('Backend refresh response did not include a session snapshot')
    }

    return toAuthIdentity(response.session)
  }
}
