import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

interface AppPageProps {
  onNavigate: (path: string) => void
}

export const AppPage = ({ onNavigate }: AppPageProps) => {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background text-white p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-semibold">{t('appPage.title')}</h1>
        <p className="mt-2 text-zinc-300">{t('appPage.description')}</p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold" onClick={() => onNavigate('/dashboard')}>
            {t('appPage.openDashboard')}
          </button>
          <button className="rounded-md border border-zinc-500 px-4 py-2" onClick={() => onNavigate('/settings')}>
            {t('appPage.settings')}
          </button>
        </div>
      </div>
    </main>
  )
}
