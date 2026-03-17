import { AuthProvider } from './app/providers/AuthProvider'
import { ProfileProvider } from './app/providers/ProfileProvider'
import { AppRouter } from './app/routing/AppRouter'
import { DocumentHead } from './components/DocumentHead'

export default function App() {
  return (
    <>
      <DocumentHead />
      <AuthProvider>
        <ProfileProvider>
          <AppRouter />
        </ProfileProvider>
      </AuthProvider>
    </>
  )
}
