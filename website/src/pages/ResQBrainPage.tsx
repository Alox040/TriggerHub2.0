import { ArrowLeft, BookOpen, GraduationCap, Users } from 'lucide-react'
import { CompanyShell } from '../components/company/CompanyShell'
import { KnowledgeOnlyDisclaimer } from '../components/company/KnowledgeOnlyDisclaimer'
import { SITE } from '../config/site'

interface ResQBrainPageProps {
  onNavigate: (path: string) => void
}

const targetGroups = [
  {
    Icon: Users,
    title: 'Rettungsdienstpersonal',
    body: 'Rettungssanitäter (RS) und Notfallsanitäter (NotSan) in aktiver Tätigkeit.',
  },
  {
    Icon: GraduationCap,
    title: 'Ausbildung und Training',
    body: 'Ausbilder, Lehrgangsleiter und Auszubildende in Hilfsorganisationen und Lehrrettungswachen.',
  },
  {
    Icon: BookOpen,
    title: 'Wissensauffrischung',
    body: 'Personen mit Grundausbildung im Rettungsdienst, die strukturiert wiederholen möchten.',
  },
] as const

const notForItems = [
  'Klinische Entscheidungsunterstützung',
  'Dosierungsberechnung oder Arzneimittelempfehlung',
  'Patientenspezifische Handlungsempfehlungen',
  'Einsatzfreigabe oder SOP-Ersatz',
  'Diagnostische Empfehlung oder Therapieplanung',
  'Betrieb als Medizinprodukt (MDR)',
]

export const ResQBrainPage = ({ onNavigate }: ResQBrainPageProps) => (
  <CompanyShell onNavigate={onNavigate}>
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Back link */}
          <button
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-white focus-visible:outline-none"
            onClick={() => onNavigate('/')}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Zurück zur Startseite
          </button>

          {/* Product badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <BookOpen aria-hidden="true" className="size-3" />
            Produktprojekt von {SITE.company.name}
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-['Sora',sans-serif] text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-[3rem] md:text-[3.25rem]">
            {SITE.resqbrain.name}
          </h1>
          <p className="mt-3 text-lg font-medium text-emerald-400">
            {SITE.resqbrain.tagline}
          </p>
          <p className="mt-5 max-w-[54ch] text-base leading-[1.8] text-slate-400">
            Eine strukturierte digitale Nachschlage- und Lernhilfe für Personen im und
            um den Rettungsdienst. ResQBrain unterstützt das Lernen, Wiederholen und
            Nachschlagen von Fachwissen — für Ausbildung, Training und persönliche
            Vorbereitung.
          </p>

          {/* Status */}
          <div className="mt-6 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-300">
            {SITE.resqbrain.status}
          </div>
        </div>
      </section>

      {/* Knowledge-only disclaimer — always visible */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-7xl">
          <KnowledgeOnlyDisclaimer />
        </div>
      </section>

      {/* What ResQBrain is */}
      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          {/* Target groups */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Für wen
            </div>
            <h2 className="mt-4 font-['Sora',sans-serif] text-2xl font-semibold text-white">
              Zielgruppen
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              {targetGroups.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                    <Icon aria-hidden="true" className="size-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-[1.7] text-slate-400">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What it is NOT */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
              Klare Grenzen
            </div>
            <h2 className="mt-4 font-['Sora',sans-serif] text-2xl font-semibold text-white">
              Was ResQBrain nicht ist
            </h2>
            <p className="mt-3 text-sm leading-[1.7] text-slate-400">
              Diese Abgrenzungen sind keine juristische Fußnote — sie sind der
              inhaltliche Kern des Produkts.
            </p>
            <ul className="mt-6 space-y-2.5">
              {notForItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <span
                    aria-hidden="true"
                    className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400/50"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pilot interest CTA */}
      <section className="border-t border-white/[0.06] bg-[#060d18] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Pilotphase
            </div>
            <h2 className="mt-4 font-['Sora',sans-serif] text-2xl font-semibold text-white">
              Interesse an der Pilotphase?
            </h2>
            <p className="mt-4 text-base leading-[1.8] text-slate-400">
              Wir suchen Ausbildungseinrichtungen, Rettungswachen und Einzelpersonen im
              Rettungsdienst, die an einer frühen Testphase teilnehmen möchten.
              Pilotpartner werden namentlich nur genannt, wenn eine Vereinbarung
              schriftlich besteht.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                href={SITE.links.mailto}
              >
                Pilotinteresse melden
              </a>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                onClick={() => onNavigate('/')}
                type="button"
              >
                Mehr über uns
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Kein Formular. Keine automatische Antwort. Nur eine direkte E-Mail.
            </p>
          </div>
        </div>
      </section>
    </main>
  </CompanyShell>
)
