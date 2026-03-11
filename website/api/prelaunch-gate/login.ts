import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendJson } from '../_auth'
import {
  createPrelaunchGatePayload,
  loadPrelaunchGateConfig,
  verifyPrelaunchAccessKey,
  writePrelaunchGateCookie,
} from '../_prelaunchGate'
import { enforceLoginRateLimit, logSecurityEvent } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
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
