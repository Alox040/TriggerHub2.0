import { Boxes, Filter, Shield, Target, Users } from 'lucide-react'

const principles = [
  {
    Icon: Target,
    title: 'Präzision statt Umfang',
    body: 'Wir bauen das, was wirklich gebraucht wird — nicht das, was sich im Feature-Sheet gut liest. Kleine, klar definierte Werkzeuge schlagen überladene Plattformen.',
  },
  {
    Icon: Users,
    title: 'Nutzernahe Entwicklung',
    body: 'Produkte entstehen im Dialog mit den Menschen, die sie nutzen. Feedback ist kein Nice-to-have, sondern das Fundament der Iteration.',
  },
  {
    Icon: Shield,
    title: 'Datenschutz als Grundhaltung',
    body: 'Keine Analytics ohne Notwendigkeit. Keine Daten, die nicht gebraucht werden. Kein Tracking, das Nutzern nichts bringt.',
  },
  {
    Icon: Boxes,
    title: 'Klare Produktgrenzen',
    body: 'Jedes Produkt hat einen definierten Scope. ResQBrain ist eine Lernhilfe — kein Entscheidungssystem. TriggerHub-Tools sind Werkzeuge — keine Plattformversprechen.',
  },
  {
    Icon: Filter,
    title: 'Keine Hype-Versprechen',
    body: 'Kein "KI revolutioniert alles". Kein "skaliert auf Millionen". Wir kommunizieren das, was implementiert ist und belegt werden kann.',
  },
] as const

export const PrinciplesSection = () => (
  <section className="border-t border-white/[0.06] px-6 py-24 md:py-32">
    <div className="mx-auto max-w-7xl">
      {/* Section header */}
      <div className="max-w-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          Arbeitsweise
        </div>
        <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold leading-[1.2] tracking-tight text-white md:text-[2.5rem]">
          Wie wir Produkte bauen.
        </h2>
        <p className="mt-4 text-base leading-[1.8] text-slate-400">
          Keine Prozessdekoration. Keine Frameworks um ihrer selbst willen. Nur Prinzipien, die
          unsere tatsächliche Arbeit leiten.
        </p>
      </div>

      {/* Principles grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map(({ Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition duration-200 hover:border-sky-400/20 hover:bg-white/[0.05]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-400/10">
              <Icon aria-hidden="true" className="size-5 text-sky-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-[1.75] text-slate-400">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)
