import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n/i18n'

type LanguageSwitcherProps = {
  variant?: 'light' | 'dark'
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage === 'de' ? 'de' : 'en'
  const baseClasses =
    variant === 'dark'
      ? 'border border-white/14 bg-white/5'
      : 'border border-slate-300 bg-white'
  const activeClasses =
    variant === 'dark' ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
  const inactiveClasses =
    variant === 'dark'
      ? 'text-white hover:bg-white/10'
      : 'text-slate-700 hover:bg-slate-100'

  return (
    <div className={`flex items-center gap-1 rounded-full p-1 ${baseClasses}`}>
      <span className="sr-only">{t('languageSwitcher.label')}</span>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          currentLanguage === 'de' ? activeClasses : inactiveClasses
        }`}
        aria-label={t('languageSwitcher.switchToGerman')}
        onClick={() => void changeLanguage('de')}
      >
        {t('languageSwitcher.german')}
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          currentLanguage === 'en' ? activeClasses : inactiveClasses
        }`}
        aria-label={t('languageSwitcher.switchToEnglish')}
        onClick={() => void changeLanguage('en')}
      >
        {t('languageSwitcher.english')}
      </button>
    </div>
  )
}
