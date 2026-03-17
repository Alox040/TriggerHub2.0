import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage === 'de' ? 'de' : 'en'

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/14 bg-white/5 p-1">
      <span className="sr-only">{t('languageSwitcher.label')}</span>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          currentLanguage === 'de' ? 'bg-white text-slate-950' : 'text-white hover:bg-white/10'
        }`}
        aria-label={t('languageSwitcher.switchToGerman')}
        onClick={() => void changeLanguage('de')}
      >
        {t('languageSwitcher.german')}
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          currentLanguage === 'en' ? 'bg-white text-slate-950' : 'text-white hover:bg-white/10'
        }`}
        aria-label={t('languageSwitcher.switchToEnglish')}
        onClick={() => void changeLanguage('en')}
      >
        {t('languageSwitcher.english')}
      </button>
    </div>
  )
}
