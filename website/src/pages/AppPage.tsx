import { useTranslation } from 'react-i18next'
import { navigateTo } from '../app/routing/navigation'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export const AppPage = () => {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher variant="light" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{t('appPage.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('appPage.description')}</p>
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold"
            onClick={() => navigateTo('/dashboard')}
          >
            {t('appPage.openDashboard')}
          </button>
          <button
            className="rounded-md border border-border px-4 py-2 text-foreground font-semibold"
            onClick={() => navigateTo('/settings')}
          >
            {t('appPage.settings')}
          </button>
        </div>
      </div>
    </main>
  )
}
