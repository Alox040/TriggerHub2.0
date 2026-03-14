import { FormEvent, useMemo, useState } from 'react'
import { usePrelaunchGate } from '../app/providers/PrelaunchGateProvider'
import { appAccessMode } from '../config/runtimeConfig'

interface AccessPageProps {
  onNavigate: (path: string) => void
  nextPath: string
}

export const AccessPage = ({ onNavigate, nextPath }: AccessPageProps) => {
  const { authorize, gateUnavailableReason } = usePrelaunchGate()
  const [accessKey, setAccessKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedNextPath = useMemo(() => (nextPath.startsWith('/') ? nextPath : '/login'), [nextPath])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await authorize(accessKey)
      onNavigate(resolvedNextPath)
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Prelaunch access failed unexpectedly')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Prelaunch Access Gate</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Access mode is <span className="font-mono">{appAccessMode}</span>. A separate prelaunch access key is required
          before the owner login becomes reachable.
        </p>

        {gateUnavailableReason ? (
          <p className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-100">
            {gateUnavailableReason}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            Access Key
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              autoComplete="off"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Checking access...' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
