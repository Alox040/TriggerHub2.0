import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function DocumentHead() {
  const { i18n, t } = useTranslation()

  useEffect(() => {
    const language = i18n.resolvedLanguage === 'de' ? 'de' : 'en'
    document.documentElement.lang = language

    const title = t('meta.title')
    const description = t('meta.description')
    const ogTitle = t('meta.ogTitle')
    const ogDescription = t('meta.ogDescription')

    document.title = title

    const setMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector)
      if (element instanceof HTMLMetaElement) {
        element.content = content
      }
    }

    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', ogTitle)
    setMeta('meta[property="og:description"]', ogDescription)
    setMeta('meta[name="twitter:title"]', ogTitle)
    setMeta('meta[name="twitter:description"]', ogDescription)
  }, [i18n.resolvedLanguage, t])

  return null
}
