import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendJson } from '../_auth'
import { loadPrelaunchGateConfig, readPrelaunchGateCookie } from '../_prelaunchGate'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
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

  if (!readPrelaunchGateCookie(req, config)) {
    sendJson(res, 401, {
      authorized: false,
      error: { code: 'PRELAUNCH_GATE_REQUIRED', message: 'Prelaunch access gate authorization is required' },
    })
    return
  }

  sendJson(res, 200, { authorized: true })
}
