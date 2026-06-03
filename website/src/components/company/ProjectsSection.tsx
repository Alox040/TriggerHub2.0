import { ArrowUpRight, BookOpen } from 'lucide-react'
import { SITE } from '../../config/site'

interface ProjectsSectionProps {
  onNavigate: (path: string) => void
}

export const ProjectsSection = ({ onNavigate }: ProjectsSectionProps) => (
  <section
    className="border-t border-white/[0.06] px-6 py-24 md:py-32"
    id="projekte"
  >
    <div className="mx-auto max-w-7xl">
      {/* Section header */}
      <div className="max-w-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          Aktuelle Projekte
        </div>
        <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold leading-[1.2] tracking-tight text-white md:text-[2.5rem]">
          Was wir bauen.
        </h2>
        <p className="mt-4 text-base leading-[1.8] text-slate-400">
          Jedes Projekt hat einen klar definierten Scope. Keine Versprechen über den
          aktuellen Entwicklungsstand hinaus.
        </p>
      </div>

      {/* Project cards */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* ResQBrain card */}
        <article className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-7 transition duration-200 hover:border-emerald-400/40 hover:bg-emerald-500/[0.07]">
          {/* Top accent line */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-transparent"
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15">
              <BookOpen aria-hidden="true" className="size-6 text-emerald-400" />
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              {SITE.resqbrain.status}
            </span>
          </div>

          <h3 className="mt-5 font-['Sora',sans-serif] text-xl font-semibold text-white">
            {SITE.resqbrain.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-emerald-400">
            {SITE.resqbrain.tagline}
          </p>
          <p className="mt-3 text-sm leading-[1.75] text-slate-400">
            Eine strukturierte Nachschlage- und Lernhilfe für Rettungsdienstpersonal.
            ResQBrain unterstützt die Wissensvorbereitung in Ausbildung und Training —
            ohne klinische Entscheidungsunterstützung oder patientenspezifische
            Empfehlungen.
          </p>

          {/* Knowledge-only pill */}
          <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-xs leading-[1.6] text-amber-300/80">
            Knowledge-only · Keine medizinische Entscheidungsunterstützung ·
            Kein Medizinprodukt
          </p>

          <button
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            onClick={() => onNavigate(SITE.links.resqbrain)}
            type="button"
          >
            Projekt ansehen
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
        </article>

        {/* Placeholder for future projects */}
        <article className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-white/[0.15] p-7">
          <p className="text-sm font-semibold text-slate-400">Weitere Projekte</p>
          <p className="mt-2 text-sm leading-[1.75] text-slate-500">
            Weitere Projektideen befinden sich in der Konzeptphase. Details werden
            kommuniziert, sobald sie belastbar sind.
          </p>
          <p className="mt-4 text-xs text-slate-600">
            Kein Projektname ohne abgestimmten Entwicklungsplan.
          </p>
        </article>
      </div>
    </div>
  </section>
)
