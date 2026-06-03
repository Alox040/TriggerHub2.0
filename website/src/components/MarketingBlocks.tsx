import { Fragment, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  FlaskConical,
  FolderGit2,
  GitBranch,
  Layers,
  Lock,
  Menu,
  Monitor,
  Package,
  Play,
  RadioTower,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { StatusBadge } from './StatusBadge'
import type { StatusBadgeStatus } from './StatusBadge'
import * as Accordion from '@radix-ui/react-accordion'
import { scrollViewport, useMotionConfig } from '../lib/motion'

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

const sectionSpacing = 'px-6 py-24 md:py-32'
const containerClass = 'mx-auto max-w-7xl'
const headingFont = "font-['Sora',sans-serif]"
const sectionTitleClass = `${headingFont} text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-[1.15]`
const sectionDescriptionClass = 'mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg'
const actionButtonBase =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const actionButtonPrimary = `${actionButtonBase} bg-white text-slate-950 shadow-[0_16px_45px_rgba(14,165,233,0.18)] hover:bg-sky-100`
const actionButtonSecondary = `${actionButtonBase} border border-white/14 text-white hover:bg-white/10`
const lightElevatedCard =
  'rounded-[1.5rem] border border-slate-900/8 bg-[#fffdf8] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.10)]'
const darkGlassCard =
  'rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-1 hover:border-sky-300/25'
const accentCard =
  'rounded-[1.5rem] border border-sky-300/18 bg-sky-300/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'

const trustPillIcons = [Cpu, Lock, FlaskConical] as const

const resolveStatus = (item: { title: string; description: string; status?: StatusBadgeStatus }): StatusBadgeStatus => {
  if (item.status) {
    return item.status
  }

  const text = `${item.title} ${item.description}`.toLowerCase()
  if (text.includes('planned') || text.includes('roadmap') || text.includes('geplant')) {
    return 'planned'
  }
  if (text.includes('development') || text.includes('entwicklung') || text.includes('experimental')) {
    return 'in-dev'
  }

  return 'live'
}

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
                className="text-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111f] rounded"
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
          <nav
            id="mobile-nav-menu"
            className="md:hidden border-t border-white/10 bg-[rgba(8,17,31,0.92)] px-6 py-4"
          >
            <div className="flex flex-col gap-3">
              {sectionLinks.map((item) => (
                <button
                  key={`mobile-${item.id}`}
                  className="rounded text-left text-sm text-slate-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  onClick={() => handleMobileNav(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
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
                  className="block rounded transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
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
              <a className="block rounded transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1" href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">
                {t('footer.githubRepository')}
              </a>
              <button className="block rounded transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1" onClick={openGithubRepo} type="button">
                {t('footer.protectedAccess')}
              </button>
              <button className="block rounded transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1" onClick={() => onNavigate('/imprint')} type="button">
                {t('footer.imprint')}
              </button>
              <button className="block rounded transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1" onClick={() => onNavigate('/privacy')} type="button">
                {t('footer.privacy')}
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
  trustPills: string[]
  onNavigate: (path: string) => void
}

export const MarketingHero = ({ title, description, trustPills, onNavigate }: MarketingHeroProps) => {
  const { t } = useTranslation()
  const motionConfig = useMotionConfig()

  return (
    <motion.section
      className={`${sectionSpacing} text-white md:pb-28`}
      initial="hidden"
      animate="show"
      variants={motionConfig.staggerContainer}
    >
      <div className={`${containerClass} grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}>
        <motion.div className="flex flex-col" variants={motionConfig.staggerContainer}>

          {/* Badge — pops in first via badgeEntry (scale + fade) */}
          <motion.div
            variants={motionConfig.badgeEntry}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-200"
          >
            {t('hero.badge')}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={motionConfig.heroEntry}
            className="mt-6 max-w-[20ch] font-['Sora',sans-serif] text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[3.25rem] md:text-[3.75rem]"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={motionConfig.heroEntry}
            className="mt-5 max-w-[52ch] text-base leading-[1.8] text-slate-300 md:text-lg"
          >
            {description}
          </motion.p>

          {/* CTA group — stacks on narrow mobile, row from sm up */}
          <motion.div
            variants={motionConfig.heroEntry}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <button
              className={`${actionButtonPrimary} cta-pulse`}
              onClick={openGithubRepo}
              type="button"
            >
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
          </motion.div>

          {/* Trust-Pills — icon + label, staggered */}
          <motion.div
            variants={motionConfig.staggerContainer}
            className="mt-8 flex flex-wrap gap-2"
          >
            {trustPills.map((pill, index) => {
              const PillIcon = trustPillIcons[index % trustPillIcons.length]
              return (
                <motion.div
                  key={pill}
                  variants={motionConfig.staggerItem}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-300"
                >
                  <PillIcon className="size-3 shrink-0 text-sky-300" />
                  {pill}
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Preview panel: hidden on phones, visible from md up */}
        <div className="hidden md:block">
          <DesktopPreview />
        </div>
      </div>
    </motion.section>
  )
}

const DesktopPreview = () => {
  const { t } = useTranslation()
  const motionConfig = useMotionConfig()

  const workflowItems = [
    { label: t('desktopPreview.trigger'),   text: t('desktopPreview.triggerDesc'),   Icon: Zap       },
    { label: t('desktopPreview.condition'), text: t('desktopPreview.conditionDesc'), Icon: GitBranch },
    { label: t('desktopPreview.macro'),     text: t('desktopPreview.macroDesc'),     Icon: Layers    },
    { label: t('desktopPreview.action'),    text: t('desktopPreview.actionDesc'),    Icon: Play      },
  ]

  const connectedItems = [
    t('desktopPreview.obsControl'),
    t('desktopPreview.spotifyActions'),
    t('desktopPreview.clipExport'),
    t('desktopPreview.pluginRuntime'),
  ]

  return (
    <motion.div className="relative" variants={motionConfig.previewEntry}>
      {/* Ambient glow — opacity handled by CSS keyframe in animations.css */}
      <div className="ambient-glow pointer-events-none absolute inset-x-8 top-6 h-48 rounded-full bg-sky-400 blur-3xl" />

      {/* App window chrome */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[#09111d] shadow-[0_32px_80px_rgba(2,6,23,0.62),0_0_0_1px_rgba(255,255,255,0.04)]">

        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400/70" />
            <span className="size-2.5 rounded-full bg-amber-300/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
            {t('desktopPreview.workflowOverview')}
          </div>
          <div className="w-[52px]" aria-hidden="true" />
        </div>

        {/* Content grid */}
        <div className="grid gap-4 p-4 lg:grid-cols-[1.25fr_0.75fr]">

          {/* Left panel — automation flow */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {t('desktopPreview.automationFlow')}
                </div>
                <div className="mt-1.5 text-base font-semibold text-white">
                  {t('desktopPreview.liveStreamStartup')}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                {t('desktopPreview.localRuntime')}
              </span>
            </div>

            {/* Workflow steps */}
            <div className="mt-4 space-y-2">
              {workflowItems.map(({ label, text, Icon }, index) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border-l-2 border-sky-300/25 bg-slate-900/60 py-2.5 pl-3 pr-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80">
                    <Icon className="size-4 text-sky-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">0{index + 1}</span>
                      <span className="text-sm font-semibold text-white">{label}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Connected surface */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t('desktopPreview.connectedSurface')}
              </div>
              <div className="mt-3 space-y-1.5">
                {connectedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-sky-300" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why it matters */}
            <div className="overflow-hidden rounded-2xl border border-sky-300/[0.12] bg-sky-300/[0.05] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                {t('desktopPreview.whyItMatters')}
              </div>
              <p className="mt-2 text-xs leading-[1.7] text-slate-300">
                {t('desktopPreview.whyItMattersText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
}: MarketingSectionProps) => {
  const motionConfig = useMotionConfig()

  return (
  <motion.section
    className={`${sectionSpacing} ${tone === 'dark' ? 'bg-[#0c1726] text-white' : 'text-slate-950'}`}
    id={id}
    initial="hidden"
    whileInView="show"
    viewport={scrollViewport}
    variants={motionConfig.staggerContainer}
  >
    <div className={containerClass}>
      <motion.div className="max-w-2xl" variants={motionConfig.slideUp}>
        <div className={`text-xs uppercase tracking-[0.24em] ${tone === 'dark' ? 'text-sky-200' : 'text-sky-700'}`}>{eyebrow}</div>
        <h2 className={`${sectionTitleClass} ${tone === 'dark' ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
        {description ? (
          <p className={`${sectionDescriptionClass} ${tone === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
        ) : null}
      </motion.div>
      <motion.div className="mt-12" variants={motionConfig.fade}>{children}</motion.div>
    </div>
  </motion.section>
  )
}

type BenefitGridProps = {
  items: Array<{ title: string; description: string }>
}

const benefitIcons = [Zap, Monitor, Workflow]

export const BenefitGrid = ({ items }: BenefitGridProps) => {
  const motionConfig = useMotionConfig()

  return (
  <motion.div className="grid gap-6 md:grid-cols-3" variants={motionConfig.staggerContainer}>
    {items.map((item, index) => {
      const Icon = benefitIcons[index % benefitIcons.length] ?? Sparkles
      return (
        <motion.article key={item.title} className={lightElevatedCard} variants={motionConfig.staggerItem}>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-slate-50">
            <Icon className="size-5 text-sky-300" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
        </motion.article>
      )
    })}
  </motion.div>
  )
}

type FeatureCardGridProps = {
  items: Array<{ title: string; description: string; bullets?: string[]; status?: StatusBadgeStatus }>
}

const featureIcons = [Zap, Workflow, RadioTower, Package, GitBranch, Boxes]

export const FeatureCardGrid = ({ items }: FeatureCardGridProps) => {
  const motionConfig = useMotionConfig()

  return (
  <motion.div className="grid gap-6 lg:grid-cols-3" variants={motionConfig.staggerContainer}>
    {items.map((item, index) => {
      const Icon = featureIcons[index % featureIcons.length] ?? Workflow
      return (
      <motion.article key={item.title} className={darkGlassCard} variants={motionConfig.staggerItem}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200">
            <Icon className="size-5" />
          </div>
          <StatusBadge status={resolveStatus(item)} />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
        {item.bullets?.length ? (
          <ul className="mt-5 space-y-3 text-sm text-slate-200">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <ChevronRight aria-hidden="true" className="mt-1 size-4 flex-none text-sky-300" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </motion.article>
      )
    })}
  </motion.div>
  )
}

type WorkflowStepsProps = {
  steps: Array<{ title: string; description: string }>
}

export const WorkflowSteps = ({ steps }: WorkflowStepsProps) => {
  const motionConfig = useMotionConfig()

  return (
  <motion.div className="flex flex-col lg:flex-row lg:items-stretch" variants={motionConfig.staggerContainer}>
    {steps.map((step, index) => (
      <Fragment key={step.title}>
        {index > 0 && (
          <div aria-hidden="true" className="flex flex-none items-center justify-center py-2 lg:self-center lg:px-2 lg:py-0">
            <div className="h-8 w-0 border-l-2 border-dashed border-slate-200 lg:h-0 lg:w-8 lg:border-l-0 lg:border-t-2" />
          </div>
        )}
        <motion.article className={`${lightElevatedCard} lg:flex-1`} variants={motionConfig.staggerItem}>
          <div className="flex items-center gap-4">
            <div className="flex size-12 flex-none items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white ring-2 ring-sky-500/25">
              0{index + 1}
            </div>
            <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
        </motion.article>
      </Fragment>
    ))}
  </motion.div>
  )
}

type TrustGridProps = {
  items: Array<{ title: string; description: string }>
}

export const TrustGrid = ({ items }: TrustGridProps) => {
  const motionConfig = useMotionConfig()
  const trustIcons = [Server, Package, Lock, FlaskConical]

  return (
  <motion.div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" variants={motionConfig.staggerContainer}>
    {items.map((item, index) => {
      const Icon = trustIcons[index % trustIcons.length] ?? ShieldCheck
      return (
      <motion.article key={item.title} className={lightElevatedCard} variants={motionConfig.staggerItem}>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-sky-300">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      </motion.article>
      )
    })}
  </motion.div>
  )
}

type FaqSectionProps = {
  items: Array<{ question: string; answer: string }>
}

export const FaqSection = ({ items }: FaqSectionProps) => {
  const motionConfig = useMotionConfig()

  return (
  <motion.div className="grid gap-4" variants={motionConfig.staggerContainer}>
    {items.map((item) => (
      <motion.div key={item.question} variants={motionConfig.staggerItem}>
        <Accordion.Root type="single" collapsible className={lightElevatedCard}>
          <Accordion.Item value={item.question}>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded bg-transparent text-left [appearance:none] [border:none] [padding:0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
              <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
              <ChevronDown className="size-5 flex-none text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="overflow-hidden">
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </motion.div>
    ))}
  </motion.div>
  )
}

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
