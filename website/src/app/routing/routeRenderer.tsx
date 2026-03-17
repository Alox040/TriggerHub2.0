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
import { InternalPage } from '../../pages/InternalPage'
import { ImprintPage, PrivacyPage } from '../../pages/LegalPage'

const rendererMap: Record<RoutePath, () => ReactElement | null> = {
  '/access': () => null,
  '/': () => <WebsiteLandingPage />,
  '/features': () => <WebsiteLandingPage />,
  '/pricing': () => <WebsiteLandingPage />,
  '/about': () => <WebsiteLandingPage />,
  '/impressum': () => <ImprintPage />,
  '/datenschutz': () => <PrivacyPage />,
  '/login': () => <LoginPage />,
  '/signup': () => <SignupPage />,
  '/app': () => <AppPage />,
  '/dashboard': () => <DashboardPage />,
  '/profile': () => <ProfilePage />,
  '/settings': () => <SettingsPage />,
  '/forbidden': () => <ForbiddenPage />,
  '/logout': () => null,
  '/imprint': () => <ImprintPage />,
  '/privacy': () => <PrivacyPage />,
  '/internal': () => <InternalPage />,
}

export const renderRoute = (path: RoutePath): ReactElement | null => rendererMap[path]()
