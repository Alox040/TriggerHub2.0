import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createOwnerSessionPayload,
  ensureCsrfCookie,
  loadOwnerServerConfig,
  sendJson,
  verifyOwnerPassword,
  writeSessionCookie,
} from '../_auth'
import { requireMethod } from '../_middleware'
import { requirePrelaunchGate } from '../_prelaunchGate'
import { enforceLoginRateLimit, logSecurityEvent } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['POST'])) {
    return
  }

  if (!enforceLoginRateLimit(req, res, 'owner_login')) {
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

  const csrfToken = ensureCsrfCookie(req, res, Math.floor(config.sessionTtlMs / 1000))
  const csrfHeader = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : ''
  if (!csrfHeader || csrfHeader !== csrfToken) {
    logSecurityEvent('owner_login_failed', req, { reason: 'csrf_missing_or_invalid' })
    sendJson(res, 403, { error: { code: 'AUTH_CSRF_REQUIRED', message: 'A valid CSRF token is required' } })
    return
  }

  const { username, password } = (req.body ?? {}) as { username?: string; password?: string }
  const normalizedUsername = (username ?? '').trim().toLowerCase()
  if (!normalizedUsername || typeof password !== 'string') {
    logSecurityEvent('owner_login_failed', req, { reason: 'invalid_request' })
    sendJson(res, 400, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Username and password are required' } })
    return
  }

  if (normalizedUsername !== config.username || !verifyOwnerPassword(password, config)) {
    logSecurityEvent('owner_login_failed', req, { reason: 'invalid_credentials' })
    sendJson(res, 401, { error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid username or password' } })
    return
  }

  const session = createOwnerSessionPayload(config)
  writeSessionCookie(res, session, config)
  logSecurityEvent('owner_login_succeeded', req)
  sendJson(res, 200, { session })
}
