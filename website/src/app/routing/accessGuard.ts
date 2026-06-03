import { evaluateRouteAccess } from '../../modules/access-control/policy'
import type { AccessMode, AuthIdentity, RoutePolicy } from '../../modules/access-control/types'

export const resolveRouteDecision = (
  policy: RoutePolicy,
  mode: AccessMode,
  identity: AuthIdentity | null,
  currentPath: string,
) => evaluateRouteAccess(policy, { mode, identity }, currentPath)
