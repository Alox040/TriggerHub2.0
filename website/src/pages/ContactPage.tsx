import { ArrowLeft, Mail } from 'lucide-react'
import { CompanyShell } from '../components/company/CompanyShell'
import { SITE } from '../config/site'

interface ContactPageProps {
  onNavigate: (path: string) => void
}

export const ContactPage = ({ onNavigate }: ContactPageProps) => (
  <CompanyShell onNavigate={onNavigate}>
    <main className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <button
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-white focus-visible:outline-none"
          onClick={() => onNavigate('/')}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Zurück
        </button>

        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          Kontakt
        </div>
        <h1 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold text-white md:text-4xl">
          Schreib uns direkt.
        </h1>
        <p className="mt-5 text-base leading-[1.8] text-slate-400">
          Kein Formular. Keine automatische Antwort. Keine CRM-Pipeline. Nur eine E-Mail
          an eine echte Person — und eine persönliche Antwort.
        </p>

        {/* Email block */}
        <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10">
              <Mail aria-hidden="true" className="size-5 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">E-Mail</p>
              <a
                className="mt-1 block text-base font-medium text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                href={SITE.links.mailto}
              >
                {SITE.owner.email}
              </a>
              <p className="mt-3 text-sm leading-[1.7] text-slate-500">
                Verantwortlich: {SITE.owner.name}
              </p>
            </div>
          </div>
        </div>

        {/* Context boxes */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-sm font-semibold text-white">Projektanfragen</p>
            <p className="mt-1.5 text-sm leading-[1.7] text-slate-500">
              Produktidee, technische Umsetzung, MVP-Planung oder Pilotkooperation.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-sm font-semibold text-white">ResQBrain Pilotinteresse</p>
            <p className="mt-1.5 text-sm leading-[1.7] text-slate-500">
              Ausbildungseinrichtungen, Rettungswachen oder Einzelpersonen für die
              frühe Testphase.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <p className="mt-8 text-xs leading-[1.7] text-slate-600">
          E-Mails werden vertraulich behandelt und ausschließlich zur Bearbeitung deiner Anfrage
          genutzt. Kein Newsletter, kein Remarketing, keine Datenweitergabe.
          Datenschutzhinweise:{' '}
          <button
            className="text-slate-500 underline hover:text-white focus-visible:outline-none"
            onClick={() => onNavigate(SITE.links.privacy)}
            type="button"
          >
            Datenschutz
          </button>
        </p>
      </div>
    </main>
  </CompanyShell>
)
