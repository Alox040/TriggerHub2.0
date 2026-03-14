import type { ReactElement } from 'react'
import type { RoutePath } from './routeManifest'
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
import { navigateTo, readNextPath } from './navigation'

export const renderRoute = (path: RoutePath): ReactElement | null => {
  const rendererMap: Record<RoutePath, () => ReactElement | null> = {
    '/access': () => <AccessPage onNavigate={navigateTo} nextPath={readNextPath()} />,
    '/': () => <WebsiteLandingPage onNavigate={navigateTo} />,
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

  return rendererMap[path]()
}
