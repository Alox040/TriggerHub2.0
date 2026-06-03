import { FormEvent, useMemo, useState } from 'react'
import { useAuth, AuthError } from '../app/providers/AuthProvider'
import { appAccessMode } from '../config/runtimeConfig'

interface LoginPageProps {
  onNavigate: (path: string) => void
  nextPath: string
}

export const LoginPage = ({ onNavigate, nextPath }: LoginPageProps) => {
  const { login, isAuthAvailable, authUnavailableReason } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedNextPath = useMemo(() => (nextPath.startsWith('/') ? nextPath : '/'), [nextPath])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      onNavigate(resolvedNextPath)
    } catch (unknownError) {
      if (unknownError instanceof AuthError) {
        setError(unknownError.message)
      } else {
        setError('Login failed unexpectedly')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
        <h1 className="text-2xl font-semibold">Owner Login</h1>
        <p className="text-sm text-zinc-300 mt-2">
          Access mode is <span className="font-mono">{appAccessMode}</span>. Public registration is currently
          disabled.
        </p>

        {!isAuthAvailable ? (
          <p className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-100">
            Owner authentication is fail-closed because runtime config is incomplete.
            {authUnavailableReason ? ` ${authUnavailableReason}` : ''}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            Username
            <input
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            className="w-full rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || !isAuthAvailable}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
