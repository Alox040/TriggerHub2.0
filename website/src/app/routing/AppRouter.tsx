import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { appAccessMode, isSignupEnabled } from '../../config/runtimeConfig'
import { useAuth } from '../providers/AuthProvider'
import { usePrelaunchGate } from '../providers/PrelaunchGateProvider'
import { resolveRouteDecision } from './accessGuard'
import { getResolvedRoutePolicy, normalizeRoutePath, type RoutePath } from './routeManifest'
import { AccessPage } from '../../pages/AccessPage'
import { LoginPage } from '../../pages/LoginPage'
import { AppPage } from '../../pages/AppPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { SettingsPage } from '../../pages/SettingsPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { WebsiteLandingPage } from '../../pages/WebsiteLandingPage'
import { MarketingPage } from '../../pages/MarketingPage'
import { SignupPage } from '../../pages/SignupPage'

const usePathname = (): string => {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocation = () => {
      setPathname(window.location.pathname)
    }
    window.addEventListener('popstate', handleLocation)
    return () => {
      window.removeEventListener('popstate', handleLocation)
    }
  }, [])

  return pathname
}

const navigateTo = (path: string) => {
  if (window.location.pathname === path) {
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const replaceTo = (path: string) => {
  window.history.replaceState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const readNextPath = (): string => {
  const search = new URLSearchParams(window.location.search)
  const nextValue = search.get('next')
  return nextValue && nextValue.startsWith('/') ? nextValue : '/'
}

export const getSystemRedirectForRoute = (path: RoutePath): string | null => {
  if (path === '/internal') {
    return '/dashboard'
  }

  return null
}

export const AppRouter = () => {
  const currentPath = usePathname()
  const normalizedPath = normalizeRoutePath(currentPath)
  const { isGateEnabled, isGateInitializing, isGateOpen } = usePrelaunchGate()
  const { identity, isInitializing, logout } = useAuth()
  const routePolicy = useMemo(
    () => getResolvedRoutePolicy(currentPath, appAccessMode, { signupEnabled: isSignupEnabled }),
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

      return <AccessPage onNavigate={navigateTo} nextPath={readNextPath()} />
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

  const rendererMap: Record<RoutePath, () => ReactElement | null> = {
    '/access': () => <AccessPage onNavigate={navigateTo} nextPath={readNextPath()} />,
    '/': () => <WebsiteLandingPage />,
    '/features': () => (
      <MarketingPage
        title="Features"
        description="Public feature overview page for the future product website."
        onNavigate={navigateTo}
      />
    ),
    '/pricing': () => (
      <MarketingPage
        title="Pricing"
        description="Public pricing page prepared for product-mode rollout."
        onNavigate={navigateTo}
      />
    ),
    '/about': () => (
      <MarketingPage
        title="About"
        description="Public about page prepared without affecting protected app routes."
        onNavigate={navigateTo}
      />
    ),
    '/login': () => <LoginPage onNavigate={navigateTo} nextPath={readNextPath()} />,
    '/signup': () => <SignupPage onNavigate={navigateTo} />,
    '/app': () => <AppPage onNavigate={navigateTo} />,
    '/dashboard': () => <DashboardPage onNavigate={navigateTo} />,
    '/profile': () => <ProfilePage onNavigate={navigateTo} />,
    '/settings': () => <SettingsPage onNavigate={navigateTo} />,
    '/forbidden': () => <ForbiddenPage onNavigate={navigateTo} />,
    '/logout': () => null,
    '/internal': () => null,
  }

  return rendererMap[normalizedPath]()
}
