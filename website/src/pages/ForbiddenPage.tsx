interface ForbiddenPageProps {
  onNavigate: (path: string) => void
}

export const ForbiddenPage = ({ onNavigate }: ForbiddenPageProps) => (
  <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6">
      <h1 className="text-2xl font-semibold text-red-200">Access denied</h1>
      <p className="text-sm text-muted-foreground mt-3">Your current account is not allowed to access this page.</p>
      <button
        className="mt-6 rounded-md border border-border px-4 py-2"
        onClick={() => onNavigate('/login')}
      >
        Back to login
      </button>
    </div>
  </main>
)
