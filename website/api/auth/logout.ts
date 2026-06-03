import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, sendJson } from '../_auth'
import { requirePrelaunchGate } from '../_prelaunchGate'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
    return
  }

  if (!requirePrelaunchGate(req, res)) {
    return
  }

  clearSessionCookie(res)
  sendJson(res, 200, {})
}
