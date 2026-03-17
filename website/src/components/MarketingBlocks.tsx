import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FolderGit2,
  GitBranch,
  Layers,
  Menu,
  Monitor,
  Play,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

const GITHUB_REPO_URL = 'https://github.com/Alox040/TriggerHub'

const openGithubRepo = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.open(GITHUB_REPO_URL, '_blank')
}

const openSection = (sectionId: string, onNavigate: (path: string) => void) => {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname !== '/') {
    onNavigate('/')
    window.setTimeout(() => {
      const target = document.getElementById(sectionId)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState({}, '', `/#${sectionId}`)
    }, 0)
    return
  }

  const target = document.getElementById(sectionId)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState({}, '', `/#${sectionId}`)
}

export const useHashSectionSync = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) {
      return
    }

    const sectionId = window.location.hash.replace('#', '')
    const target = document.getElementById(sectionId)
    if (!target) {
      return
    }

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [])
}

const sectionSpacing = 'px-6 py-16 md:py-20'
const containerClass = 'mx-auto max-w-7xl'
const headingFont = "font-['Sora',sans-serif]"
const sectionTitleClass = `${headingFont} text-3xl font-semibold tracking-tight md:text-5xl`
const sectionDescriptionClass = 'mt-5 text-lg leading-7 text-slate-600'
const actionButtonBase =
  'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300'
const actionButtonPrimary = `${actionButtonBase} bg-white text-slate-950 hover:bg-sky-100`
const actionButtonSecondary = `${actionButtonBase} border border-white/14 text-white hover:bg-white/10`
const cardBase = 'rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]'
const lightCard = 'rounded-[1.5rem] border border-slate-200 bg-white p-6'
const darkCard = 'rounded-[1.5rem] border border-white/10 bg-white/5 p-6'

type MarketingShellProps = {
  children: ReactNode
  onNavigate: (path: string) => void
}

export const MarketingShell = ({ children, onNavigate }: MarketingShellProps) => {
  const { t } = useTranslation()
  const sectionLinks = [
    { id: 'benefits', label: t('nav.benefits') },
    { id: 'features', label: t('nav.features') },
    { id: 'workflow', label: t('nav.howItWorks') },
    { id: 'extensions', label: t('nav.extensions') },
    { id: 'faq', label: t('nav.faq') },
  ]
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prev) => !prev)
  }
  const handleMobileNav = (sectionId: string): void => {
    setIsMobileMenuOpen(false)
    openSection(sectionId, onNavigate)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(73,126,255,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_20%),linear-gradient(180deg,#08111f_0%,#0c1726_45%,#f4f1ea_45%,#f7f4ee_100%)] text-slate-950">
      <header className="relative sticky top-0 z-40 border-b border-white/60 bg-[rgba(8,17,31,0.78)] text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <button className="text-left" onClick={() => onNavigate('/')} type="button">
            <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.18em] text-sky-300">{t('header.logo')}</div>
            <div className="mt-1 text-xs text-slate-300">{t('header.tagline')}</div>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {sectionLinks.map((item) => (
              <button
                key={item.id}
                className="text-sm text-slate-300 transition hover:text-white"
                onClick={() => openSection(item.id, onNavigate)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              className="rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8"
              onClick={openGithubRepo}
              type="button"
            >
              {t('header.protectedAccess')}
            </button>
            <button
              className="ml-2 rounded-full border border-white/14 p-2 text-white transition hover:bg-white/10 md:hidden"
              onClick={toggleMobileMenu}
              type="button"
              aria-label="Toggle navigation"
              aria-controls="mobile-nav-menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen ? (
          <div
            id="mobile-nav-menu"
            role="menu"
            className="md:hidden border-t border-white/10 bg-[rgba(8,17,31,0.92)] px-6 py-4"
          >
            <div className="flex flex-col gap-3">
              {sectionLinks.map((item) => (
                <button
                  key={`mobile-${item.id}`}
                  className="text-left text-sm text-slate-200 transition hover:text-white"
                  onClick={() => handleMobileNav(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-[#f7f4ee]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.18em] text-slate-900">{t('header.logo')}</div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{t('footer.productInfo')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">{t('footer.product')}</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {sectionLinks.map((item) => (
                <button
                  key={item.id}
                  className="block transition hover:text-slate-900"
                  onClick={() => openSection(item.id, onNavigate)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">{t('footer.links')}</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a className="block transition hover:text-slate-900" href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">
                {t('footer.githubRepository')}
              </a>
              <button className="block transition hover:text-slate-900" onClick={openGithubRepo} type="button">
                {t('footer.protectedAccess')}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

type MarketingHeroProps = {
  title: string
  description: string
  proofPoints: string[]
  onNavigate: (path: string) => void
}

export const MarketingHero = ({ title, description, proofPoints, onNavigate }: MarketingHeroProps) => {
  const { t } = useTranslation()

  return (
    <section className={`${sectionSpacing} text-white md:pb-24`}>
      <div className={`${containerClass} grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}>
        <div>
          <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-sky-200">
            {t('hero.badge')}
          </div>
          <h1 className="mt-6 max-w-4xl font-['Sora',sans-serif] text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.08]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className={actionButtonPrimary} onClick={openGithubRepo} type="button">
              {t('hero.requestAccess')}
              <ArrowRight className="size-4" />
            </button>
            <button
              className={actionButtonSecondary}
              onClick={() => openSection('features', onNavigate)}
              type="button"
            >
              {t('hero.seeCapabilities')}
            </button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <DesktopPreview />
      </div>
    </section>
  )
}

const DesktopPreview = () => {
  const { t } = useTranslation()
  const workflowItems = [
    { label: t('desktopPreview.trigger'), text: t('desktopPreview.triggerDesc') },
    { label: t('desktopPreview.condition'), text: t('desktopPreview.conditionDesc') },
    { label: t('desktopPreview.macro'), text: t('desktopPreview.macroDesc') },
    { label: t('desktopPreview.action'), text: t('desktopPreview.actionDesc') },
  ]
  const stepIcons = [Zap, GitBranch, Layers, Play]
  const connectedItems = [
    t('desktopPreview.obsControl'),
    t('desktopPreview.spotifyActions'),
    t('desktopPreview.clipExport'),
    t('desktopPreview.pluginRuntime'),
  ]

  return (
    <div className="relative">
      <div className="absolute inset-x-12 top-10 h-40 rounded-full bg-sky-400/18 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111d]/92 shadow-[0_30px_90px_rgba(2,6,23,0.48)]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-rose-400/80" />
            <span className="size-3 rounded-full bg-amber-300/80" />
            <span className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{t('desktopPreview.workflowOverview')}</div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{t('desktopPreview.automationFlow')}</div>
                <div className="mt-2 text-lg font-semibold text-white">{t('desktopPreview.liveStreamStartup')}</div>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {t('desktopPreview.localRuntime')}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {workflowItems.map((item, index) => {
                const Icon = stepIcons[index] ?? Sparkles
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-slate-900/50 px-4 py-4"
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900/60 text-slate-100">
                      <Icon className="size-5 text-sky-200" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{t('desktopPreview.connectedSurface')}</div>
              <div className="mt-4 space-y-3">
                {connectedItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/14 px-4 py-3 text-sm text-slate-200">
                    <CheckCircle2 className="size-4 text-sky-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-sky-300/14 bg-sky-300/8 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-sky-100/80">{t('desktopPreview.whyItMatters')}</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">{t('desktopPreview.whyItMattersText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type MarketingSectionProps = {
  id?: string
  eyebrow: string
  title: string
  description?: string
  tone?: 'light' | 'dark'
  children: ReactNode
}

export const MarketingSection = ({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
  children,
}: MarketingSectionProps) => (
  <section
    className={`${sectionSpacing} ${tone === 'dark' ? 'bg-[#0c1726] text-white' : 'text-slate-950'}`}
    id={id}
  >
    <div className={containerClass}>
      <div className="max-w-3xl">
        <div className={`text-xs uppercase tracking-[0.24em] ${tone === 'dark' ? 'text-sky-200' : 'text-sky-700'}`}>{eyebrow}</div>
        <h2 className={`${sectionTitleClass} ${tone === 'dark' ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
        {description ? (
          <p className={`${sectionDescriptionClass} ${tone === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </div>
  </section>
)

type BenefitGridProps = {
  items: Array<{ title: string; description: string }>
}

const benefitIcons = [Zap, Monitor, Workflow]

export const BenefitGrid = ({ items }: BenefitGridProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {items.map((item, index) => {
      const Icon = benefitIcons[index % benefitIcons.length] ?? Sparkles
      return (
        <article key={item.title} className={cardBase}>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-900">
            <Icon className="size-5 text-sky-500" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
        </article>
      )
    })}
  </div>
)

type FeatureCardGridProps = {
  items: Array<{ title: string; description: string; bullets?: string[] }>
}

export const FeatureCardGrid = ({ items }: FeatureCardGridProps) => (
  <div className="grid gap-6 lg:grid-cols-3">
    {items.map((item) => (
      <article key={item.title} className={darkCard}>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200">
          <Workflow className="size-5" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
        {item.bullets?.length ? (
          <ul className="mt-5 space-y-3 text-sm text-slate-200">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <ChevronRight className="mt-1 size-4 flex-none text-sky-300" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    ))}
  </div>
)

type WorkflowStepsProps = {
  steps: Array<{ title: string; description: string }>
}

export const WorkflowSteps = ({ steps }: WorkflowStepsProps) => (
  <div className="grid gap-6 lg:grid-cols-3">
    {steps.map((step, index) => (
      <article key={step.title} className={cardBase}>
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            0{index + 1}
          </div>
          <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
      </article>
    ))}
  </div>
)

type TrustGridProps = {
  items: Array<{ title: string; description: string }>
}

export const TrustGrid = ({ items }: TrustGridProps) => (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <article key={item.title} className={`${lightCard} bg-[#fffdf8]`}>
        <ShieldCheck className="size-5 text-sky-700" />
        <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      </article>
    ))}
  </div>
)

type FaqSectionProps = {
  items: Array<{ question: string; answer: string }>
}

export const FaqSection = ({ items }: FaqSectionProps) => (
  <div className="grid gap-4">
    {items.map((item) => (
      <article key={item.question} className={`${lightCard} shadow-[0_20px_60px_rgba(15,23,42,0.05)]`}>
        <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
      </article>
    ))}
  </div>
)

type MarketingCtaProps = {
  title: string
  description: string
  onNavigate: (path: string) => void
}

export const MarketingCta = ({ title, description, onNavigate }: MarketingCtaProps) => {
  const { t } = useTranslation()

  return (
    <section className={`${sectionSpacing} pb-24`}>
      <div className={containerClass}>
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#08111f_0%,#0d2438_55%,#12314d_100%)] p-8 text-white shadow-[0_35px_90px_rgba(2,6,23,0.35)] md:p-12">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200">{t('cta.finalLabel')}</div>
            <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold md:text-4xl">{title}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className={actionButtonPrimary} onClick={openGithubRepo} type="button">
              {t('cta.requestProtectedAccess')}
            </button>
            <a
              className={actionButtonSecondary}
              href={GITHUB_REPO_URL}
              rel="noreferrer"
              target="_blank"
            >
              <FolderGit2 className="size-4" />
              {t('cta.viewRepository')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
