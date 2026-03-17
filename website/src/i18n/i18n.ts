import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import deCommon from './locales/de/common.json'
import enCommon from './locales/en/common.json'

export const LOCALE_STORAGE_KEY = 'triggerhub_website_lang'
export const SUPPORTED_LANGUAGES = ['de', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

const getStoredLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const value = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return value === 'de' || value === 'en' ? value : DEFAULT_LANGUAGE
}

export const setStoredLanguage = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, language)
}

export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  setStoredLanguage(language)
  await i18n.changeLanguage(language)
}

void i18n.use(initReactI18next).init({
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  resources: {
    de: {
      common: deCommon,
    },
    en: {
      common: enCommon,
    },
  },
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
