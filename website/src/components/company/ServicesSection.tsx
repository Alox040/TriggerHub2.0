import { BookMarked, Code2, FlaskConical, Layout, Workflow } from 'lucide-react'

const services = [
  {
    Icon: Code2,
    title: 'Digitale Produktprototypen',
    body: 'Von der Idee zum lauffähigen Prototypen — mit klarer technischer Grundlage und ehrlichem Scope.',
  },
  {
    Icon: Layout,
    title: 'UI/UX und Produktstruktur',
    body: 'Nutzerführung, Informationsarchitektur und Designsystem — praxistauglich und ohne Designtheater.',
  },
  {
    Icon: BookMarked,
    title: 'Wissens- und Referenzsysteme',
    body: 'Strukturierte Lern- und Nachschlagetools für Fachbereiche mit hoher Präzisionsanforderung.',
  },
  {
    Icon: Workflow,
    title: 'Automatisierung und interne Tools',
    body: 'Desktop-Tools und Workflow-Automatisierung für repetitive, fehleranfällige manuelle Prozesse.',
  },
  {
    Icon: FlaskConical,
    title: 'MVP-Validierung',
    body: 'Schnelle, schlanke Umsetzung zur Überprüfung von Produkthypothesen — bevor skaliert wird.',
  },
] as const

export const ServicesSection = () => (
  <section
    className="border-t border-white/[0.06] bg-[#060d18] px-6 py-24 md:py-32"
    id="leistungen"
  >
    <div className="mx-auto max-w-7xl">
      {/* Section header */}
      <div className="max-w-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          Leistungen
        </div>
        <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold leading-[1.2] tracking-tight text-white md:text-[2.5rem]">
          Was wir anbieten.
        </h2>
        <p className="mt-4 text-base leading-[1.8] text-slate-400">
          Kein Full-Service-Anspruch. Klarer Fokus auf die Bereiche, in denen wir
          tatsächlich etwas beitragen können.
        </p>
      </div>

      {/* Services grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-200 hover:border-sky-400/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/10">
                <Icon aria-hidden="true" className="size-4 text-sky-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            <p className="mt-3 text-sm leading-[1.75] text-slate-400">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)
