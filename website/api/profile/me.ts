import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureCsrfCookie, sendJson } from '../_auth'
import { requireAuthenticatedSession, requireMethod } from '../_middleware'
import { loadOrCreateProfileForSession, updateProfileForSession } from '../_profile'
import { ProfileValidationError } from '../../src/modules/profile/validation'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, ['GET', 'POST'])) {
    return
  }

  const context = requireAuthenticatedSession(req, res, {
    requireCsrf: req.method === 'POST',
  })
  if (!context) {
    return
  }

  ensureCsrfCookie(req, res, Math.floor(context.config.sessionTtlMs / 1000))

  try {
    if (req.method === 'GET') {
      const profile = await loadOrCreateProfileForSession(context.session)
      sendJson(res, 200, { profile })
      return
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const profile = await updateProfileForSession(
      context.session,
      {
        display_name: typeof body.display_name === 'string' ? body.display_name : '',
        avatar_url: typeof body.avatar_url === 'string' ? body.avatar_url : '',
        bio: typeof body.bio === 'string' ? body.bio : '',
      },
    )
    sendJson(res, 200, { profile })
  } catch (error) {
    if (error instanceof ProfileValidationError) {
      sendJson(res, 400, {
        error: {
          code: 'PROFILE_INVALID',
          message: error.message,
        },
      })
      return
    }

    sendJson(res, 500, {
      error: {
        code: 'PROFILE_UNAVAILABLE',
        message: 'Profile service is unavailable',
      },
    })
  }
}
