import type { ReactElement } from 'react'
import type { RoutePath } from './routeManifest'
import { WebsiteLandingPage } from '../../pages/WebsiteLandingPage'
import { LoginPage } from '../../pages/LoginPage'
import { AppPage } from '../../pages/AppPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { SettingsPage } from '../../pages/SettingsPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { SignupPage } from '../../pages/SignupPage'
import { navigateTo, readNextPath } from './navigation'

export const renderRoute = (path: RoutePath): ReactElement | null => {
  const rendererMap: Record<RoutePath, () => ReactElement | null> = {
    '/access': () => null,
    '/': () => <WebsiteLandingPage />,
    '/features': () => <WebsiteLandingPage />,
    '/pricing': () => <WebsiteLandingPage />,
    '/about': () => <WebsiteLandingPage />,
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

  return rendererMap[path]()
}
