import { useEffect, useMemo } from 'react'
import { appAccessMode } from '../../config/runtimeConfig'
import { useAuth } from '../providers/AuthProvider'
import { usePrelaunchGate } from '../providers/PrelaunchGateProvider'
import { resolveRouteDecision } from './accessGuard'
import { getResolvedRoutePolicy, getSystemRedirectForRoute, normalizeRoutePath } from './routeManifest'
import { replaceTo, usePathname } from './navigation'
import { renderRoute } from './routeRenderer'

export const AppRouter = () => {
  const currentPath = usePathname()
  const normalizedPath = normalizeRoutePath(currentPath)
  const { isGateEnabled, isGateInitializing, isGateOpen } = usePrelaunchGate()
  const { identity, isInitializing, logout } = useAuth()
  const routePolicy = useMemo(
    () => getResolvedRoutePolicy(currentPath, appAccessMode),
    [currentPath],
  )
  const decision = resolveRouteDecision(routePolicy, appAccessMode, identity, currentPath)

  useEffect(() => {
    if (appAccessMode === 'private_prelaunch' && isGateEnabled) {
      if (isGateInitializing) {
        return
      }

      if (!isGateOpen && normalizedPath !== '/access') {
        replaceTo(`/access?next=${encodeURIComponent(currentPath)}`)
      }
      return
    }

    if (isInitializing) {
      return
    }

    if (!decision.allow && decision.redirectTo) {
      replaceTo(decision.redirectTo)
    }
  }, [
    appAccessMode,
    currentPath,
    decision.allow,
    decision.redirectTo,
    isGateEnabled,
    isGateInitializing,
    isGateOpen,
    isInitializing,
    normalizedPath,
  ])

  if (appAccessMode === 'private_prelaunch' && isGateEnabled) {
    if (isGateInitializing) {
      return null
    }

    if (!isGateOpen) {
      if (normalizedPath !== '/access') {
        return null
      }

      return renderRoute('/access')
    }

    if (normalizedPath === '/access') {
      replaceTo('/login')
      return null
    }
  }

  if (isInitializing) {
    return null
  }

  if (!decision.allow) {
    return null
  }
  if (identity && normalizedPath === '/login') {
    replaceTo('/dashboard')
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
