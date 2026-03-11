interface DashboardPageProps {
  onNavigate: (path: string) => void
}

export const DashboardPage = ({ onNavigate }: DashboardPageProps) => (
  <main className="min-h-screen bg-[#0b0b0c] text-white p-6">
    <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-zinc-300">Protected dashboard route prepared for future user accounts.</p>
      <div className="mt-6 flex gap-3">
        <button className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold" onClick={() => onNavigate('/profile')}>
          Profile
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/settings')}>
          Settings
        </button>
      </div>
    </div>
  </main>
)
