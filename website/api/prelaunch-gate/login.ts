import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureCsrfCookie, sendJson } from '../_auth'
import { requireMethod } from '../_middleware'
import {
  createPrelaunchGatePayload,
  loadPrelaunchGateConfig,
  verifyPrelaunchAccessKey,
  writePrelaunchGateCookie,
} from '../_prelaunchGate'
import { enforceLoginRateLimit, logSecurityEvent } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['POST'])) {
    return
  }

  if (!enforceLoginRateLimit(req, res, 'prelaunch_gate_login')) {
    return
  }

  let config
  try {
    config = loadPrelaunchGateConfig()
  } catch {
    sendJson(res, 503, {
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_UNAVAILABLE', message: 'Prelaunch access gate config is incomplete' },
    })
    return
  }

  const csrfToken = ensureCsrfCookie(req, res, Math.floor(config.gateTtlMs / 1000))
  const csrfHeader = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : ''
  if (!csrfHeader || csrfHeader !== csrfToken) {
    logSecurityEvent('prelaunch_gate_login_failed', req, { reason: 'csrf_missing_or_invalid' })
    sendJson(res, 403, {
      authorized: false,
      error: { code: 'AUTH_CSRF_REQUIRED', message: 'A valid CSRF token is required' },
    })
    return
  }

  const { accessKey } = (req.body ?? {}) as { accessKey?: string }
  if (typeof accessKey !== 'string' || !accessKey.trim()) {
    logSecurityEvent('prelaunch_gate_login_failed', req, { reason: 'invalid_request' })
    sendJson(res, 400, {
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_INVALID_REQUEST', message: 'Access key is required' },
    })
    return
  }

  if (!verifyPrelaunchAccessKey(accessKey.trim(), config)) {
    logSecurityEvent('prelaunch_gate_login_failed', req, { reason: 'invalid_access_key' })
    sendJson(res, 401, {
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_INVALID_KEY', message: 'Invalid access key' },
    })
    return
  }

  writePrelaunchGateCookie(res, createPrelaunchGatePayload(config), config)
  logSecurityEvent('prelaunch_gate_login_succeeded', req)
  sendJson(res, 200, { authorized: true })
}
