import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { appAccessMode } from '../../config/runtimeConfig'

interface PrelaunchGateContextValue {
  isGateEnabled: boolean
  isGateOpen: boolean
  isGateInitializing: boolean
  gateUnavailableReason: string | null
  authorize: (accessKey: string) => Promise<void>
}

const PrelaunchGateContext = createContext<PrelaunchGateContextValue | null>(null)

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

export const PrelaunchGateProvider = ({ children }: { children: ReactNode }) => {
  const isGateEnabled = appAccessMode === 'private_prelaunch'
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [isGateInitializing, setIsGateInitializing] = useState(isGateEnabled)
  const [gateUnavailableReason, setGateUnavailableReason] = useState<string | null>(null)

  useEffect(() => {
    if (!isGateEnabled) {
      setIsGateOpen(true)
      setIsGateInitializing(false)
      setGateUnavailableReason(null)
      return
    }

    let isActive = true

    fetch('/api/prelaunch-gate/me', {
      method: 'GET',
      credentials: 'same-origin',
    })
      .then(async (response) => {
        if (!isActive) {
          return
        }

        if (response.status === 401) {
          setIsGateOpen(false)
          setGateUnavailableReason(null)
          setIsGateInitializing(false)
          return
        }

        if (response.status === 503) {
          setIsGateOpen(false)
          setGateUnavailableReason(await parseErrorMessage(response, 'Prelaunch access gate is unavailable'))
          setIsGateInitializing(false)
          return
        }

        if (!response.ok) {
          setIsGateOpen(false)
          setGateUnavailableReason(await parseErrorMessage(response, 'Failed to verify prelaunch access gate'))
          setIsGateInitializing(false)
          return
        }

        setIsGateOpen(true)
        setGateUnavailableReason(null)
        setIsGateInitializing(false)
      })
      .catch(() => {
        if (isActive) {
          setIsGateOpen(false)
          setGateUnavailableReason('Failed to verify prelaunch access gate')
          setIsGateInitializing(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [isGateEnabled])

  const value = useMemo<PrelaunchGateContextValue>(
    () => ({
      isGateEnabled,
      isGateOpen,
      isGateInitializing,
      gateUnavailableReason,
      authorize: async (accessKey: string) => {
        const csrfToken = readCookieValue('th_csrf')
        const response = await fetch('/api/prelaunch-gate/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          credentials: 'same-origin',
          body: JSON.stringify({ accessKey }),
        })

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response, 'Invalid access key'))
        }

        setIsGateOpen(true)
        setGateUnavailableReason(null)
      },
    }),
    [gateUnavailableReason, isGateEnabled, isGateInitializing, isGateOpen],
  )

  return <PrelaunchGateContext.Provider value={value}>{children}</PrelaunchGateContext.Provider>
}

export const usePrelaunchGate = (): PrelaunchGateContextValue => {
  const context = useContext(PrelaunchGateContext)
  if (!context) {
    throw new Error('usePrelaunchGate must be used within PrelaunchGateProvider')
  }

  return context
}
