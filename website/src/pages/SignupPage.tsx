import { appAccessMode } from '../config/runtimeConfig'

interface SignupPageProps {
  onNavigate: (path: string) => void
}

export const SignupPage = ({ onNavigate }: SignupPageProps) => (
  <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
      <h1 className="text-2xl font-semibold">Account Registration</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Public registration is not available in{' '}
        <span className="font-mono">{appAccessMode}</span> mode.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Access is currently restricted to the site owner.
      </p>
      <button
        className="mt-6 rounded-md border border-border px-4 py-2 text-sm"
        onClick={() => onNavigate('/login')}
      >
        Sign in instead
      </button>
    </div>
  </main>
)
