import { ArrowRight, Construction } from 'lucide-react'
import { SITE } from '../../config/site'

interface HeroSectionProps {
  onNavigate: (path: string) => void
}

export const HeroSection = ({ onNavigate }: HeroSectionProps) => (
  <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
    {/* Ambient background glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-3xl"
    />

    <div className="relative mx-auto max-w-7xl">
      {/* Status badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/[0.07] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
        <Construction className="size-3" aria-hidden="true" />
        {SITE.company.statusLabel}
      </div>

      {/* Headline */}
      <h1 className="mt-7 max-w-[18ch] font-['Sora',sans-serif] text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[3.25rem] md:text-[3.75rem]">
        Digitale Werkzeuge für Menschen in anspruchsvollen Kontexten.
      </h1>

      {/* Subline */}
      <p className="mt-6 max-w-[54ch] text-base leading-[1.8] text-slate-400 md:text-lg">
        {SITE.company.name} entwickelt fokussierte Software — Referenzsysteme, Wissenstools und
        Automatisierungswerkzeuge, die in der tatsächlichen Arbeit funktionieren und nicht
        im Pitch-Deck.
      </p>

      {/* CTAs */}
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          href={SITE.links.mailto}
        >
          Kontakt aufnehmen
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={() => onNavigate(SITE.links.resqbrain)}
          type="button"
        >
          {SITE.resqbrain.name} ansehen
        </button>
      </div>

      {/* Trust pills */}
      <div aria-label="Orientierungspunkte" className="mt-10 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
          Keine Tracking-Tools
        </span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
          Datenschutzbewusst entwickelt
        </span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
          Unabhängig und bootstrapped
        </span>
      </div>
    </div>
  </section>
)
