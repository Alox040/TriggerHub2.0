import { useTranslation } from 'react-i18next'
import { navigateTo } from '../app/routing/navigation'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export const ForbiddenPage = () => {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher variant="light" />
        </div>
        <h1 className="text-2xl font-semibold text-red-200">{t('forbidden.title')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('forbidden.description')}</p>
        <button
          className="mt-6 rounded-md border border-border px-4 py-2"
          onClick={() => navigateTo('/login')}
        >
          {t('forbidden.backToLogin')}
        </button>
      </div>
    </main>
  )
}
