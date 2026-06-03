import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createOwnerSessionPayload,
  loadOwnerServerConfig,
  sendJson,
  verifyOwnerPassword,
  writeSessionCookie,
} from '../_auth'
import { requirePrelaunchGate } from '../_prelaunchGate'
import { enforceLoginRateLimit, logSecurityEvent } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
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
