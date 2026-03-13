import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureCsrfCookie, sendJson } from '../_auth'
import { requireMethod } from '../_middleware'
import { loadPrelaunchGateConfig, readPrelaunchGateCookie } from '../_prelaunchGate'
import { enforceApiRateLimit } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['GET'])) {
    return
  }

  if (!enforceApiRateLimit(req, res, 'auth_session_read')) {
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

  ensureCsrfCookie(req, res, Math.floor(config.gateTtlMs / 1000))

  if (!readPrelaunchGateCookie(req, config)) {
    sendJson(res, 401, {
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_REQUIRED', message: 'Prelaunch access gate authorization is required' },
    })
    return
  }

  sendJson(res, 200, { authorized: true })
}
