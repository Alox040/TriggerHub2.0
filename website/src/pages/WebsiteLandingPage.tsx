import { useTranslation } from 'react-i18next'
import {
  BenefitGrid,
  FaqSection,
  FeatureCardGrid,
  MarketingCta,
  MarketingHero,
  MarketingSection,
  MarketingShell,
  TrustGrid,
  WorkflowSteps,
  useHashSectionSync,
} from '../components/MarketingBlocks'
import { navigateTo } from '../app/routing/navigation'

type TextCard = {
  title: string
  description: string
}

type BulletCard = TextCard & {
  bullets?: string[]
}

type FaqItem = {
  question: string
  answer: string
}

export const WebsiteLandingPage = () => {
  const { t } = useTranslation()

  useHashSectionSync()

  const heroTrustPills = t('landing.hero.trustPills', { returnObjects: true }) as string[]
  const benefits = t('landing.benefits.items', { returnObjects: true }) as TextCard[]
  const featureCards = t('landing.featureCards.items', { returnObjects: true }) as BulletCard[]
  const workflowSteps = t('landing.workflowSteps.items', { returnObjects: true }) as TextCard[]
  const trustItems = t('landing.trustItems.items', { returnObjects: true }) as TextCard[]
  const extensionCards = t('landing.extensionCards.items', { returnObjects: true }) as BulletCard[]
  const faqItems = t('landing.faq.items', { returnObjects: true }) as FaqItem[]

  return (
    <MarketingShell onNavigate={navigateTo}>
      <main>
        <MarketingHero
          title={t('landing.hero.title')}
          description={t('landing.hero.description')}
          trustPills={heroTrustPills}
          onNavigate={navigateTo}
        />

        <MarketingSection
          id="benefits"
          eyebrow={t('landing.sections.benefits.eyebrow')}
          title={t('landing.sections.benefits.title')}
          description={t('landing.sections.benefits.description')}
        >
          <BenefitGrid items={benefits} />
        </MarketingSection>

        <MarketingSection
          id="features"
          eyebrow={t('landing.sections.features.eyebrow')}
          title={t('landing.sections.features.title')}
          description={t('landing.sections.features.description')}
          tone="dark"
        >
          <FeatureCardGrid items={featureCards} />
        </MarketingSection>

        <MarketingSection
          id="workflow"
          eyebrow={t('landing.sections.workflow.eyebrow')}
          title={t('landing.sections.workflow.title')}
          description={t('landing.sections.workflow.description')}
        >
          <WorkflowSteps steps={workflowSteps} />
        </MarketingSection>

        <MarketingSection
          id="extensions"
          eyebrow={t('landing.sections.extensions.eyebrow')}
          title={t('landing.sections.extensions.title')}
          description={t('landing.sections.extensions.description')}
          tone="dark"
        >
          <FeatureCardGrid items={extensionCards} />
        </MarketingSection>

        <MarketingSection
          eyebrow={t('landing.sections.trust.eyebrow')}
          title={t('landing.sections.trust.title')}
          description={t('landing.sections.trust.description')}
        >
          <TrustGrid items={trustItems} />
        </MarketingSection>

        <MarketingSection
          id="faq"
          eyebrow={t('landing.sections.faq.eyebrow')}
          title={t('landing.sections.faq.title')}
          description={t('landing.sections.faq.description')}
        >
          <FaqSection items={faqItems} />
        </MarketingSection>

        <MarketingCta
          title={t('landing.cta.title')}
          description={t('landing.cta.description')}
          onNavigate={navigateTo}
        />
      </main>
    </MarketingShell>
  )
}
