import type { ReactElement } from 'react'
import type { RoutePath } from './routeManifest'
import { LoginPage } from '../../pages/LoginPage'
import { AppPage } from '../../pages/AppPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { SettingsPage } from '../../pages/SettingsPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { WebsiteLandingPage } from '../../pages/WebsiteLandingPage'
import { SignupPage } from '../../pages/SignupPage'
import { InternalPage } from '../../pages/InternalPage'

const rendererMap: Record<RoutePath, () => ReactElement | null> = {
  '/access': () => null,
  '/': () => <WebsiteLandingPage />,
  '/features': () => <WebsiteLandingPage />,
  '/pricing': () => <WebsiteLandingPage />,
  '/about': () => <WebsiteLandingPage />,
  '/login': () => <LoginPage />,
  '/signup': () => <SignupPage />,
  '/app': () => <AppPage />,
  '/dashboard': () => <DashboardPage />,
  '/profile': () => <ProfilePage />,
  '/settings': () => <SettingsPage />,
  '/forbidden': () => <ForbiddenPage />,
  '/logout': () => null,
  '/internal': () => <InternalPage />,
}

export const renderRoute = (path: RoutePath): ReactElement | null => rendererMap[path]()
