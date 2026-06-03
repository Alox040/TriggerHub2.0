import { AlertTriangle } from 'lucide-react'
import { SITE } from '../../config/site'

/**
 * KnowledgeOnlyDisclaimer
 *
 * MANDATORY on every ResQBrain page and section.
 * This component must NEVER be removed, hidden behind a toggle,
 * or reduced to a footnote without legal review.
 *
 * ResQBrain is a knowledge reference tool ONLY.
 * It is NOT a medical device, decision-support system, or dosage calculator.
 */
export const KnowledgeOnlyDisclaimer = () => (
  <aside
    aria-label="Wichtiger Hinweis zum Nutzungskontext"
    className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5"
    role="note"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-amber-400"
      />
      <div>
        <p className="text-sm font-semibold text-amber-300">
          Nutzungshinweis — Knowledge-only
        </p>
        <p className="mt-1.5 text-sm leading-[1.7] text-amber-200/80">
          {SITE.resqbrain.knowledgeOnlyDisclaimer}
        </p>
        <p className="mt-2 text-xs text-amber-300/60">
          ResQBrain ist kein Medizinprodukt im Sinne der MDR. Keine klinische
          Entscheidungsunterstützung. Keine patientenspezifischen Empfehlungen.
          Keine Dosierungsberechnung. Keine Einsatzfreigabe.
        </p>
      </div>
    </div>
  </aside>
)
