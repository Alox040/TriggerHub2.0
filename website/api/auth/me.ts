import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureCsrfCookie, loadOwnerServerConfig, readSessionCookie, sendJson } from '../_auth'
import { requireMethod } from '../_middleware'
import { requirePrelaunchGate } from '../_prelaunchGate'
import { enforceApiRateLimit } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['GET'])) {
    return
  }

  if (!enforceApiRateLimit(req, res, 'auth_session_read')) {
    return
  }

  if (!requirePrelaunchGate(req, res)) {
    return
  }

  let config
  try {
    config = loadOwnerServerConfig()
  } catch {
    sendJson(res, 503, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Owner auth server config is incomplete' } })
    return
  }

  ensureCsrfCookie(req, res, Math.floor(config.sessionTtlMs / 1000))
  const session = readSessionCookie(req, config)
  if (!session) {
    sendJson(res, 401, {
      authenticated: false,
      error: {
        code: 'AUTH_UNAUTHENTICATED',
        message: 'No active owner session',
      },
    })
    return
  }

  if (session.role !== 'owner') {
    sendJson(res, 403, {
      authenticated: true,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Insufficient role for this resource',
      },
    })
    return
  }

  sendJson(res, 200, {
    authenticated: true,
    session,
  })
}
