import crypto from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  loadOwnerServerConfig,
  readCsrfCookie,
  readSessionCookie,
  sendJson,
  type OwnerServerConfig,
  type SignedSessionPayload,
} from './_auth'
import { requirePrelaunchGate } from './_prelaunchGate'
import type { UserRole } from '../src/modules/access-control/types'

interface RequireAuthOptions {
  allowedRoles?: UserRole[]
  requireCsrf?: boolean
}

export interface AuthenticatedRequestContext {
  config: OwnerServerConfig
  session: SignedSessionPayload
}

export const requireMethod = (
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: ReadonlyArray<'GET' | 'POST'>,
): boolean => {
  if (allowedMethods.includes((req.method ?? '') as 'GET' | 'POST')) {
    return true
  }

  sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
  return false
}

const matchesCsrfToken = (expectedToken: string | null, providedToken: string | undefined): boolean => {
  if (!expectedToken || typeof providedToken !== 'string') {
    return false
  }

  const expected = Buffer.from(expectedToken, 'utf8')
  const provided = Buffer.from(providedToken, 'utf8')
  if (expected.length === 0 || expected.length !== provided.length) {
    return false
  }

  return crypto.timingSafeEqual(expected, provided)
}

export const requireAuthenticatedSession = (
  req: VercelRequest,
  res: VercelResponse,
  options: RequireAuthOptions = {},
): AuthenticatedRequestContext | null => {
  if (!requirePrelaunchGate(req, res)) {
    return null
  }

  let config: OwnerServerConfig
  try {
    config = loadOwnerServerConfig()
  } catch {
    sendJson(res, 503, {
      error: {
        code: 'AUTH_INVALID_REQUEST',
        message: 'Owner auth server config is incomplete',
      },
    })
    return null
  }

  const session = readSessionCookie(req, config)
  if (!session) {
    sendJson(res, 401, {
      authenticated: false,
      error: {
        code: 'AUTH_UNAUTHENTICATED',
        message: 'No active owner session',
      },
    })
    return null
  }

  if (options.allowedRoles && !options.allowedRoles.includes(session.role)) {
    sendJson(res, 403, {
      authenticated: true,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Insufficient role for this resource',
      },
    })
    return null
  }

  if (options.requireCsrf) {
    const csrfCookie = readCsrfCookie(req)
    const csrfHeader = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : undefined
    if (!matchesCsrfToken(csrfCookie, csrfHeader)) {
      sendJson(res, 403, {
        error: {
          code: 'AUTH_CSRF_REQUIRED',
          message: 'A valid CSRF token is required',
        },
      })
      return null
    }
  }

  return {
    config,
    session,
  }
}
