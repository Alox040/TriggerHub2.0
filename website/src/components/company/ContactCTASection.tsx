import { Mail } from 'lucide-react'
import { SITE } from '../../config/site'

export const ContactCTASection = () => (
  <section
    className="border-t border-white/[0.06] px-6 py-24 md:py-32"
    id="kontakt-cta"
  >
    <div className="mx-auto max-w-7xl">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,#08111f_0%,#0d1f38_55%,#102a44_100%)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.5)] md:p-12">
        {/* Top accent */}
        <div
          aria-hidden="true"
          className="mb-8 h-[1px] w-16 bg-gradient-to-r from-sky-400/60 to-transparent"
        />

        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
            Kontakt
          </div>
          <h2 className="mt-4 font-['Sora',sans-serif] text-2xl font-semibold text-white md:text-3xl">
            Projektidee, Pilotphase oder Austausch?
          </h2>
          <p className="mt-4 text-base leading-[1.8] text-slate-400">
            Kein Sales-Funnel, kein Formular mit Pflichtfeldern. Wenn ein Thema
            passt, schreib eine kurze E-Mail — wir antworten persönlich.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            href={SITE.links.mailto}
          >
            <Mail aria-hidden="true" className="size-4" />
            {SITE.owner.email}
          </a>
          <p className="text-sm text-slate-500">
            Keine automatische Antwort. Kein Newsletter-Opt-in.
          </p>
        </div>
      </div>
    </div>
  </section>
)
