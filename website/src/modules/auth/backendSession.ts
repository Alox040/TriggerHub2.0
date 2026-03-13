import { AuthError } from './errors'
import type { BackendSessionSnapshot } from './backendAuthContract'
import type { AuthSession } from './types'

const isIsoDate = (value: string): boolean => Number.isFinite(Date.parse(value))

export const isOwnerSessionSnapshot = (value: unknown): value is BackendSessionSnapshot => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<BackendSessionSnapshot>
  return (
    typeof session.userId === 'string' &&
    session.userId.length > 0 &&
    session.role === 'owner' &&
    typeof session.email === 'string' &&
    session.email.length > 0 &&
    typeof session.issuedAt === 'string' &&
    isIsoDate(session.issuedAt) &&
    typeof session.expiresAt === 'string' &&
    isIsoDate(session.expiresAt) &&
    typeof session.lastAuthenticatedAt === 'string' &&
    isIsoDate(session.lastAuthenticatedAt) &&
    typeof session.sessionVersion === 'number' &&
    Number.isInteger(session.sessionVersion) &&
    session.sessionVersion >= 1
  )
}

export const createServerBackedSession = (session: BackendSessionSnapshot): AuthSession => {
  if (!isOwnerSessionSnapshot(session)) {
    throw new AuthError('Backend session snapshot is invalid for owner-only prelaunch mode')
  }

  const issuedAt = Date.parse(session.issuedAt)
  const expiresAt = Date.parse(session.expiresAt)
  if (expiresAt <= issuedAt) {
    throw new AuthError('Backend session snapshot has an invalid lifetime')
  }

  const randomId = crypto.randomUUID().replaceAll('-', '')
  return {
    sessionId: randomId,
    guardId: randomId,
    userId: session.userId,
    role: session.role,
    email: session.email,
    identityCreatedAt: issuedAt,
    createdAt: issuedAt,
    expiresAt,
  }
}
