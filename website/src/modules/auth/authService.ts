import type {
  AuthConfig,
  AuthIdentity,
  AuthIdentityProvider,
  AuthPort,
  AuthSession,
  LoginRequest,
  SessionStore,
} from './types'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

const createSessionId = (): string => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const isHexString = (value: string, expectedLength: number): boolean =>
  value.length === expectedLength && /^[0-9a-f]+$/i.test(value)

const createGuardId = (): string => createSessionId()

export class AuthService implements AuthPort {
  constructor(
    private readonly config: AuthConfig,
    private readonly sessionStore: SessionStore,
    private readonly identityProvider: AuthIdentityProvider,
  ) {}

  getSession(): AuthSession | null {
    return this.sessionStore.read()
  }

  hydrateSession(): AuthSession | null {
    const session = this.sessionStore.read()
    if (!session) {
      return null
    }

    if (!isHexString(session.sessionId, 32) || !isHexString(session.guardId, 32)) {
      this.sessionStore.clear()
      return null
    }

    if (!session.email || typeof session.email !== 'string') {
      this.sessionStore.clear()
      return null
    }

    if (session.expiresAt <= session.createdAt) {
      this.sessionStore.clear()
      return null
    }

    if (session.expiresAt - session.createdAt > this.config.sessionTtlMs) {
      this.sessionStore.clear()
      return null
    }

    if (session.expiresAt <= Date.now()) {
      this.sessionStore.clear()
      return null
    }

    const identity: AuthIdentity = {
      userId: session.userId,
      role: session.role,
      email: session.email,
      createdAt: session.identityCreatedAt,
    }

    if (!this.identityProvider.isSessionIdentityValid(identity)) {
      this.sessionStore.clear()
      return null
    }

    return session
  }

  async login(request: LoginRequest): Promise<AuthSession> {
    const identity = await this.identityProvider.authenticate(request)

    const createdAt = Date.now()
    const session: AuthSession = {
      sessionId: createSessionId(),
      guardId: createGuardId(),
      userId: identity.userId,
      role: identity.role,
      email: identity.email,
      identityCreatedAt: identity.createdAt,
      createdAt,
      expiresAt: createdAt + this.config.sessionTtlMs,
    }

    this.sessionStore.write(session)
    return session
  }

  logout(): void {
    this.sessionStore.clear()
  }
}
