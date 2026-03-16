import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { appAccessMode, isSignupEnabled } from '../../config/runtimeConfig'
import { useAuth } from '../providers/AuthProvider'
import { resolveRouteDecision } from './accessGuard'
import { getResolvedRoutePolicy, type RoutePath } from './routeManifest'
import { LoginPage } from '../../pages/LoginPage'
import { AppPage } from '../../pages/AppPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { SettingsPage } from '../../pages/SettingsPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { WebsiteLandingPage } from '../../pages/WebsiteLandingPage'
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

export const normalizeRoutePath = (path: string): RoutePath =>
  (path in {
    '/': true,
    '/features': true,
    '/pricing': true,
    '/about': true,
    '/login': true,
    '/signup': true,
    '/app': true,
    '/dashboard': true,
    '/profile': true,
    '/settings': true,
    '/forbidden': true,
    '/logout': true,
    '/internal': true,
  }
    ? path
    : '/') as RoutePath

export const getSystemRedirectForRoute = (path: RoutePath): string | null => {
  if (path === '/internal') {
    return '/dashboard'
  }

  return null
}

export const AppRouter = () => {
  const currentPath = usePathname()
  const { identity, logout } = useAuth()
  const routePolicy = useMemo(
    () => getResolvedRoutePolicy(currentPath, appAccessMode, { signupEnabled: isSignupEnabled }),
    [currentPath],
  )
  const decision = resolveRouteDecision(routePolicy, appAccessMode, identity, currentPath)

  useEffect(() => {
    if (!decision.allow && decision.redirectTo) {
      replaceTo(decision.redirectTo)
    }
  }, [decision.allow, decision.redirectTo])

  if (!decision.allow) {
    return null
  }

  const normalizedPath = normalizeRoutePath(currentPath)

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
    '/': () => <WebsiteLandingPage onNavigate={navigateTo} />,
    '/features': () => <WebsiteLandingPage onNavigate={navigateTo} />,
    '/pricing': () => <WebsiteLandingPage onNavigate={navigateTo} />,
    '/about': () => <WebsiteLandingPage onNavigate={navigateTo} />,
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
