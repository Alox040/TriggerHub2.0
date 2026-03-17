import { useAuth } from '../app/providers/AuthProvider'
import { useTranslation } from 'react-i18next'
import { navigateTo } from '../app/routing/navigation'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export const InternalPage = () => {
  const { t } = useTranslation()
  const { session, logout } = useAuth()

  return (
    <main className="min-h-screen bg-background text-white p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900/80 p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-semibold">{t('internal.title')}</h1>
        <p className="mt-2 text-zinc-300">
          {t('internal.loggedInAs', {
            userId: session?.userId ?? '',
            role: session?.role ?? '',
          })}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold"
            onClick={() => navigateTo('/dashboard')}
          >
            {t('internal.openDashboard')}
          </button>
          <button
            className="rounded-md border border-zinc-500 px-4 py-2"
            onClick={() => navigateTo('/profile')}
          >
            {t('internal.openProfile')}
          </button>
          <button
            className="rounded-md border border-zinc-500 px-4 py-2"
            onClick={() => {
              logout()
              navigateTo('/login')
            }}
          >
            {t('internal.logout')}
          </button>
        </div>
      </div>
    </main>
  )
}
