import { useEffect, useMemo } from 'react'
import { appAccessMode } from '../../config/runtimeConfig'
import { useAuth } from '../providers/AuthProvider'
import { resolveRouteDecision } from './accessGuard'
import { getResolvedRoutePolicy, getSystemRedirectForRoute, normalizeRoutePath } from './routeManifest'
import { replaceTo, usePathname } from './navigation'
import { renderRoute } from './routeRenderer'

export const AppRouter = () => {
  const currentPath = usePathname()
  const normalizedPath = normalizeRoutePath(currentPath)
  const { identity, isInitializing, logout } = useAuth()
  const routePolicy = useMemo(
    () => getResolvedRoutePolicy(currentPath, appAccessMode),
    [currentPath],
  )
  const decision = resolveRouteDecision(routePolicy, appAccessMode, identity, currentPath)

  useEffect(() => {
    if (isInitializing) {
      return
    }

    if (identity && normalizedPath === '/login') {
      replaceTo('/dashboard')
      return
    }

    if (!decision.allow && decision.redirectTo) {
      replaceTo(decision.redirectTo)
    }
  }, [
    decision.allow,
    decision.redirectTo,
    identity,
    normalizedPath,
    isInitializing,
  ])

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    )
  }

  if (!decision.allow) {
    return null
  }
  if (normalizedPath === '/logout') {
    logout()
    replaceTo('/login')
    return null
  }

  const systemRedirect = getSystemRedirectForRoute(normalizedPath)
  if (systemRedirect) {
    replaceTo(systemRedirect)
    return null
  }
  return renderRoute(normalizedPath)
}
