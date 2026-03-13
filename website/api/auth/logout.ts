import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, sendJson } from '../_auth'
import { requireAuthenticatedSession, requireMethod } from '../_middleware'
import { enforceApiRateLimit } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['POST'])) {
    return
  }

  if (!enforceApiRateLimit(req, res, 'auth_logout')) {
    return
  }

  if (!requireAuthenticatedSession(req, res, { allowedRoles: ['owner'], requireCsrf: true })) {
    return
  }

  clearSessionCookie(res)
  sendJson(res, 200, {})
}
