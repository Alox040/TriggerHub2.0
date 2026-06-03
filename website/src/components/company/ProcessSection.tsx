import { Fragment } from 'react'

const steps = [
  {
    number: '01',
    title: 'Verstehen',
    body: 'Nutzungssituation, Kontext und tatsächlicher Bedarf werden vor dem ersten Code-Commit analysiert.',
  },
  {
    number: '02',
    title: 'Strukturieren',
    body: 'Produktgrenzen, Informationsarchitektur und technische Grundlage werden geklärt und dokumentiert.',
  },
  {
    number: '03',
    title: 'Prototypisieren',
    body: 'Ein lauffähiger, testbarer Prototyp entsteht — ohne Over-Engineering und mit klarem Scope.',
  },
  {
    number: '04',
    title: 'Validieren',
    body: 'Der Prototyp wird mit realen Nutzern oder Pilotpartnern getestet. Feedback fließt direkt zurück.',
  },
  {
    number: '05',
    title: 'Iterieren',
    body: 'Auf Basis belastbarer Erkenntnisse wird gezielt verbessert — kein Feature-Creep ohne Begründung.',
  },
] as const

export const ProcessSection = () => (
  <section
    className="border-t border-white/[0.06] px-6 py-24 md:py-32"
    id="prozess"
  >
    <div className="mx-auto max-w-7xl">
      {/* Section header */}
      <div className="max-w-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          Prozess
        </div>
        <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold leading-[1.2] tracking-tight text-white md:text-[2.5rem]">
          Wie ein Projekt entsteht.
        </h2>
        <p className="mt-4 text-base leading-[1.8] text-slate-400">
          Kein Wasserfall, kein Sprint-Theater. Strukturierte Iteration mit echten
          Zwischenergebnissen.
        </p>
      </div>

      {/* Steps — horizontal connector on desktop, vertical on mobile */}
      <div className="mt-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map((step, index) => (
            <Fragment key={step.number}>
              <article className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 lg:flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0c1726] font-['Sora',sans-serif] text-sm font-semibold text-sky-300 ring-1 ring-sky-400/20">
                    {step.number}
                  </div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-[1.75] text-slate-400">{step.body}</p>
              </article>

              {/* Connector between steps */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center py-2 lg:px-2 lg:py-0"
                >
                  <div className="h-6 w-[1px] border-l border-dashed border-white/[0.12] lg:h-[1px] lg:w-6 lg:border-l-0 lg:border-t" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  </section>
)
