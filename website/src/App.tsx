import { AuthProvider } from './app/providers/AuthProvider'
import { PrelaunchGateProvider } from './app/providers/PrelaunchGateProvider'
import { ProfileProvider } from './app/providers/ProfileProvider'
import { AppRouter } from './app/routing/AppRouter'

export default function App() {
  return (
    <PrelaunchGateProvider>
      <AuthProvider>
        <ProfileProvider>
          <AppRouter />
        </ProfileProvider>
      </AuthProvider>
    </PrelaunchGateProvider>
  )
}
