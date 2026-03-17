import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth, AuthError } from '../app/providers/AuthProvider'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { navigateTo, readNextPath } from '../app/routing/navigation'

export const LoginPage = () => {
  const { t } = useTranslation()
  const { login, isAuthAvailable } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextPath = readNextPath()
  const resolvedNextPath = useMemo(
    () => (nextPath.startsWith('/') ? nextPath : '/'),
    [nextPath],
  )
  const translateAuthError = (message: string): string => {
    const keyByMessage: Record<string, string> = {
      'Invalid username or password': 'errors.auth.invalid_credentials',
      'Logout failed': 'errors.auth.logout_failed',
      'Failed to validate owner session': 'errors.auth.validate_session_failed',
      'Session refresh is not implemented in prelaunch auth mode': 'errors.auth.refresh_not_implemented',
      'Backend login response did not include a session snapshot': 'errors.auth.no_session_snapshot',
      'Owner authentication is unavailable': 'errors.auth.auth_unavailable',
    }

    const translationKey = keyByMessage[message]
    return translationKey ? t(translationKey) : message
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      navigateTo(resolvedNextPath)
    } catch (unknownError) {
      if (unknownError instanceof AuthError) {
        setError(translateAuthError(unknownError.message))
      } else {
        setError(t('auth.login.errorUnexpected'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher variant="light" />
        </div>
        <h1 className="text-2xl font-semibold">{t('auth.login.title')}</h1>
        {!isAuthAvailable ? (
          <p className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-100">
            {t('auth.login.authUnavailable')}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            {t('auth.login.username')}
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            {t('auth.login.password')}
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || !isAuthAvailable}
          >
            {isSubmitting ? t('auth.login.signingIn') : t('auth.login.submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
