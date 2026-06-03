import type { AccessDecision, AccessMode, AuthIdentity, RoutePolicy } from './types'

export interface AccessContext {
  mode: AccessMode
  identity: AuthIdentity | null
}

export const evaluateRouteAccess = (
  policy: RoutePolicy,
  context: AccessContext,
  nextPath: string,
): AccessDecision => {
  if (policy.allowInModes && !policy.allowInModes.includes(context.mode)) {
    return { allow: false, reason: 'mode_blocked', redirectTo: '/login' }
  }

  if (policy.visibility === 'public') {
    return { allow: true }
  }

  if (!context.identity) {
    return {
      allow: false,
      reason: 'unauthenticated',
      redirectTo: `/login?next=${encodeURIComponent(nextPath)}`,
    }
  }

  if (policy.ownerOnly && context.identity.role !== 'owner') {
    return { allow: false, reason: 'insufficient_role', redirectTo: '/forbidden' }
  }

  return { allow: true }
}
