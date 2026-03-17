import { motion } from 'motion/react'
import { Workflow, Plug, Puzzle, Zap, Clock, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FeatureAccordion } from './FeatureAccordion'

type FeatureItem = {
  title: string
  description: string
  expandedContent: {
    explanation: string
    example: string
    integrations: string[]
  }
}

const featureIcons = [Workflow, Plug, Puzzle, Zap, Clock, Monitor]

export function Features() {
  const { t } = useTranslation()
  const featureItems = t('legacy.features.items', { returnObjects: true }) as FeatureItem[]
  const features = featureItems.map((feature, index) => ({
    ...feature,
    icon: featureIcons[index] ?? Workflow,
  }))

  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-500">
            {t('legacy.features.eyebrow')}
          </p>
          <h2 className="text-5xl font-bold text-white md:text-6xl">{t('legacy.features.title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-400">
            {t('legacy.features.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FeatureAccordion
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                expandedContent={feature.expandedContent}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
