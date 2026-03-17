import { useTranslation } from 'react-i18next'
import { MarketingShell } from '../components/MarketingBlocks'
import { navigateTo } from '../app/routing/navigation'

type LegalSection = {
  heading: string
  body: string
}

type LegalContent = {
  title: string
  description?: string
  sections: LegalSection[]
}

type LegalPageProps = {
  contentKey: 'legal.imprint' | 'legal.privacy'
}

const LegalPage = ({ contentKey }: LegalPageProps) => {
  const { t } = useTranslation()
  const content = t(contentKey, { returnObjects: true }) as LegalContent

  return (
    <MarketingShell onNavigate={navigateTo}>
      <main className="px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto max-w-4xl space-y-12 rounded-[1.75rem] border border-white/10 bg-white/90 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.35)] backdrop-blur">
          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-500">{t('legal.label')}</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{content.title}</h1>
            {content.description ? (
              <p className="text-base leading-7 text-slate-700">{content.description}</p>
            ) : null}
          </header>

          <div className="space-y-10">
            {content.sections.map((section) => (
              <article key={section.heading} className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
                <p className="text-sm leading-7 text-slate-700">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </MarketingShell>
  )
}

export const ImprintPage = () => <LegalPage contentKey="legal.imprint" />
export const PrivacyPage = () => <LegalPage contentKey="legal.privacy" />
