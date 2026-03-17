import { useTranslation } from 'react-i18next'
import { navigateTo } from '../app/routing/navigation'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { appAccessMode } from '../config/runtimeConfig'

export const SignupPage = () => {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher variant="light" />
        </div>
        <h1 className="text-2xl font-semibold">{t('auth.signup.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.signup.notAvailable', { mode: appAccessMode })}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.signup.restricted')}</p>
        <button
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm"
          onClick={() => navigateTo('/login')}
        >
          {t('auth.signup.signInInstead')}
        </button>
      </div>
    </main>
  )
}
