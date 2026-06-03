import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthService, AuthError } from '../../modules/auth/authService'
import { OwnerAuthProvider } from '../../modules/auth/ownerAuthProvider'
import { createLocalSessionStore } from '../../modules/auth/sessionStore'
import type { AuthSession, LoginRequest } from '../../modules/auth/types'
import { authConfig, ownerAuthConfigStatus, ownerProviderConfig } from '../../config/runtimeConfig'
import type { AuthIdentity } from '../../modules/access-control/types'

interface AuthContextValue {
  session: AuthSession | null
  identity: AuthIdentity | null
  isAuthenticated: boolean
  isAuthAvailable: boolean
  authUnavailableReason: string | null
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

const authService = authConfig && ownerProviderConfig
  ? new AuthService(
      authConfig,
      createLocalSessionStore(),
      new OwnerAuthProvider(ownerProviderConfig),
    )
  : null

const AuthContext = createContext<AuthContextValue | null>(null)

const toIdentity = (session: AuthSession | null): AuthIdentity | null =>
  session
    ? {
        userId: session.userId,
        role: session.role,
        email: session.email,
        createdAt: session.identityCreatedAt,
      }
    : null

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    if (!authService) {
      setSession(null)
      return
    }

    setSession(authService.hydrateSession())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      identity: toIdentity(session),
      isAuthenticated: Boolean(session),
      isAuthAvailable: Boolean(authService),
      authUnavailableReason: authService ? null : ownerAuthConfigStatus.reasons.join('; '),
      login: async (request) => {
        if (!authService) {
          throw new AuthError('Owner authentication is unavailable due to missing runtime configuration')
        }
        const nextSession = await authService.login(request)
        setSession(nextSession)
      },
      logout: () => {
        if (authService) {
          authService.logout()
        }
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { AuthError }
