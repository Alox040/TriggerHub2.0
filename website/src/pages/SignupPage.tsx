import { appAccessMode, isSignupEnabled } from '../config/runtimeConfig'

interface SignupPageProps {
  onNavigate: (path: string) => void
}

export const SignupPage = ({ onNavigate }: SignupPageProps) => (
  <main className="min-h-screen bg-[#0b0b0c] text-white p-6">
    <div className="mx-auto max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
      <h1 className="text-2xl font-semibold">Signup</h1>
      <p className="mt-2 text-zinc-300">
        Access mode: <span className="font-mono">{appAccessMode}</span>
      </p>
      <p className="mt-4 text-zinc-300">
        {isSignupEnabled
          ? 'Signup is enabled by configuration. Implementation of the public registration flow is the next step.'
          : 'Signup is currently disabled. Existing owner login remains active and unchanged.'}
      </p>
      <div className="mt-6 flex gap-3">
        <button className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold" onClick={() => onNavigate('/login')}>
          Go to Login
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/')}>
          Back to Landing
        </button>
      </div>
    </div>
  </main>
)
