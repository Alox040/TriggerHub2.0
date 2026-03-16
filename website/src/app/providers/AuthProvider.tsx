import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthError } from '../../modules/auth/errors'
import { createServerBackedSession } from '../../modules/auth/backendSession'
import type { AuthSession, LoginRequest } from '../../modules/auth/types'
import type { AuthIdentity } from '../../modules/access-control/types'
import type { BackendAuthApi } from '../../modules/auth/backendAuthContract'

interface AuthContextValue {
  session: AuthSession | null
  identity: AuthIdentity | null
  isAuthenticated: boolean
  isInitializing: boolean
  isAuthAvailable: boolean
  authUnavailableReason: string | null
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

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

const parseErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: { message?: string } }
    return payload.error?.message ?? fallbackMessage
  } catch {
    return fallbackMessage
  }
}

const readCookieValue = (cookieName: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const encodedName = `${cookieName}=`
  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(encodedName))

  return cookie ? cookie.slice(encodedName.length) : null
}

const backendAuthApi: BackendAuthApi = {
  login: async (request) => {
    const csrfToken = readCookieValue('th_csrf')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new AuthError(await parseErrorMessage(response, 'Invalid username or password'))
    }

    return (await response.json()) as Awaited<ReturnType<BackendAuthApi['login']>>
  },
  logout: async () => {
    const csrfToken = readCookieValue('th_csrf')
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: csrfToken
        ? {
            'X-CSRF-Token': csrfToken,
          }
        : {},
      credentials: 'same-origin',
    })

    if (!response.ok) {
      throw new AuthError(await parseErrorMessage(response, 'Logout failed'))
    }
  },
  getCurrentSession: async () => {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
    })

    if (response.status === 401) {
      return {
        authenticated: false,
      }
    }

    if (!response.ok) {
      throw new AuthError(await parseErrorMessage(response, 'Failed to validate owner session'))
    }

    return (await response.json()) as Awaited<ReturnType<BackendAuthApi['getCurrentSession']>>
  },
  refresh: async () => {
    throw new AuthError('Session refresh is not implemented in prelaunch auth mode')
  },
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [authUnavailableReason, setAuthUnavailableReason] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    setIsInitializing(true)
    backendAuthApi
      .getCurrentSession()
      .then((response) => {
        if (!isActive) {
          return
        }

        if (!response.authenticated || !response.session) {
          setSession(null)
          setAuthUnavailableReason(null)
          setIsInitializing(false)
          return
        }

        setSession(createServerBackedSession(response.session))
        setAuthUnavailableReason(null)
        setIsInitializing(false)
      })
      .catch((error: unknown) => {
        if (isActive) {
          setSession(null)
          setAuthUnavailableReason(
            error instanceof AuthError ? error.message : 'Owner authentication is unavailable',
          )
          setIsInitializing(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      identity: toIdentity(session),
      isAuthenticated: Boolean(session),
      isInitializing,
      isAuthAvailable: authUnavailableReason === null,
      authUnavailableReason,
      login: async (request) => {
        const response = await backendAuthApi.login(request)
        if (!response.session) {
          throw new AuthError('Backend login response did not include a session snapshot')
        }
        setSession(createServerBackedSession(response.session))
        setAuthUnavailableReason(null)
      },
      logout: () => {
        void backendAuthApi.logout().finally(() => {
          setSession(null)
          setAuthUnavailableReason(null)
        })
      },
    }),
    [authUnavailableReason, isInitializing, session],
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
