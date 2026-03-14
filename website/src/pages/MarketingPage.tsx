interface MarketingPageProps {
  title: string
  description: string
  onNavigate: (path: string) => void
}

export const MarketingPage = ({ title, description, onNavigate }: MarketingPageProps) => (
  <main className="min-h-screen bg-background text-white p-6">
    <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-zinc-300">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold" onClick={() => onNavigate('/')}>
          Landing
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/features')}>
          Features
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/pricing')}>
          Pricing
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/about')}>
          About
        </button>
        <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/login')}>
          Login
        </button>
      </div>
    </div>
  </main>
)
