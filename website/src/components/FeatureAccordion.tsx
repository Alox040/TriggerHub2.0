import { motion, AnimatePresence } from 'motion/react'
import { LucideIcon, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface FeatureAccordionProps {
  icon: LucideIcon
  title: string
  description: string
  expandedContent?: {
    explanation: string
    example: string
    integrations: string[]
  }
}

export function FeatureAccordion({ icon: Icon, title, description, expandedContent }: FeatureAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()

  return (
    <motion.div
      layout
      className={`relative cursor-pointer rounded-2xl border backdrop-blur-xl transition-all ${
        isExpanded
          ? 'bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border-sky-500/40 shadow-lg shadow-sky-500/10'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-4 p-6">
        <div
          className={`flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 transition-transform ${
            isExpanded ? 'scale-110' : 'group-hover:scale-105'
          }`}
        >
          <Icon className="size-6 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 text-gray-400"
            >
              <ChevronRight className="size-5" />
            </motion.div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">{description}</p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-sky-500/20 px-6 pb-6 pt-0">
              <div className="space-y-4 pt-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-400">
                    {t('legacy.featureAccordion.howItWorks')}
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-300">
                    {expandedContent.explanation}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-background p-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {t('legacy.featureAccordion.example')}
                  </h4>
                  <p className="font-mono text-sm text-gray-300">{expandedContent.example}</p>
                </div>

                {expandedContent.integrations.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t('legacy.featureAccordion.worksWith')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expandedContent.integrations.map((integration) => (
                        <span
                          key={integration}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                        >
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
