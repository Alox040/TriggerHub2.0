import { AuthProvider } from './app/providers/AuthProvider'
import { ProfileProvider } from './app/providers/ProfileProvider'
import { AppRouter } from './app/routing/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppRouter />
      </ProfileProvider>
    </AuthProvider>
  )
}
