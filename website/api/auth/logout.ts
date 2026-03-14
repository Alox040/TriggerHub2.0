import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, sendJson, validateCsrfToken } from '../_auth'
import { requireAuthenticatedSession, requireMethod } from '../_middleware'
import { enforceApiRateLimit } from '../_security'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['POST'])) {
    return
  }

  if (!enforceApiRateLimit(req, res, 'auth_logout')) {
    return
  }

  if (!validateCsrfToken(req)) {
    sendJson(res, 403, { error: 'CSRF validation failed' })
    return
  }

  if (!requireAuthenticatedSession(req, res, { allowedRoles: ['owner'] })) {
    return
  }

  clearSessionCookie(res)
  sendJson(res, 200, {})
}
