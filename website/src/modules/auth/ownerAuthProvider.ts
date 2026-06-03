import { verifyPasswordHash } from './passwordHashing'
import { AuthError } from './authService'
import type { AuthIdentity, AuthIdentityProvider, LoginRequest, OwnerCredentialConfig } from './types'

export class OwnerAuthProvider implements AuthIdentityProvider {
  constructor(private readonly ownerConfig: OwnerCredentialConfig) {}

  async authenticate(request: LoginRequest): Promise<AuthIdentity> {
    const normalizedUsername = request.username.trim().toLowerCase()
    if (normalizedUsername !== this.ownerConfig.username.toLowerCase()) {
      throw new AuthError('Invalid username or password')
    }

    const isValidPassword = await verifyPasswordHash(
      request.password,
      this.ownerConfig.passwordHashBase64,
      this.ownerConfig.saltBase64,
      this.ownerConfig.iterations,
    )

    if (!isValidPassword) {
      throw new AuthError('Invalid username or password')
    }

    return {
      userId: this.ownerConfig.userId,
      role: 'owner',
      email: this.ownerConfig.email,
    }
  }

  isSessionIdentityValid(identity: AuthIdentity): boolean {
    return (
      identity.userId === this.ownerConfig.userId &&
      identity.role === 'owner' &&
      identity.email.toLowerCase() === this.ownerConfig.email.toLowerCase()
    )
  }
}
