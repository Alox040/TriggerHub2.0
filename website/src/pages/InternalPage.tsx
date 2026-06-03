import { useAuth } from '../app/providers/AuthProvider'

interface InternalPageProps {
  onNavigate: (path: string) => void
}

export const InternalPage = ({ onNavigate }: InternalPageProps) => {
  const { session, logout } = useAuth()

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
        <h1 className="text-2xl font-semibold">Internal Owner Area</h1>
        <p className="mt-2 text-zinc-300">
          Logged in as <span className="font-mono">{session?.userId}</span> with role{' '}
          <span className="font-mono">{session?.role}</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold"
            onClick={() => onNavigate('/dashboard')}
          >
            Open Dashboard
          </button>
          <button
            className="rounded-md border border-zinc-500 px-4 py-2"
            onClick={() => onNavigate('/profile')}
          >
            Open Profile
          </button>
          <button
            className="rounded-md border border-zinc-500 px-4 py-2"
            onClick={() => {
              logout()
              onNavigate('/login')
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  )
}
