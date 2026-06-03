import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadOwnerServerConfig, readSessionCookie, sendJson } from '../_auth'
import { requirePrelaunchGate } from '../_prelaunchGate'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: { code: 'AUTH_INVALID_REQUEST', message: 'Method not allowed' } })
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

  sendJson(res, 200, {
    authenticated: true,
    session,
  })
}
