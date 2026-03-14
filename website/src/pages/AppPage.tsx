interface AppPageProps {
  onNavigate: (path: string) => void
}

export const AppPage = ({ onNavigate }: AppPageProps) => (
  <main className="min-h-screen bg-background text-white p-6">
    <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
      <h1 className="text-2xl font-semibold">App</h1>
      <p className="mt-2 text-zinc-300">Protected application shell. This route remains protected in all modes.</p>
      <div className="mt-6 flex gap-3">
        <button className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold" onClick={() => onNavigate('/dashboard')}>
          Open Dashboard
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/settings')}>
          Settings
        </button>
      </div>
    </div>
  </main>
)
