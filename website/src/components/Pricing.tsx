import { motion } from "motion/react";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying automation",
    features: [
      "5 active workflows",
      "Core integrations (OBS, Spotify, Discord)",
      "Community templates",
      "Basic automation editor",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Creator",
    price: "$12",
    period: "per month",
    description: "For serious streamers",
    features: [
      "Unlimited workflows",
      "All integrations",
      "Premium templates",
      "Advanced conditions & logic",
      "Priority support",
      "Cloud sync",
    ],
    cta: "Start 14-day Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For power users & teams",
    features: [
      "Everything in Creator",
      "Custom integrations via Webhooks",
      "Plugin SDK access",
      "Multi-device sync",
      "Team collaboration",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start free, upgrade when ready
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.popular
                  ? "bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border-sky-500/40 shadow-xl shadow-sky-500/10 md:scale-105"
                  : "bg-zinc-950/50 border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white text-sm font-semibold flex items-center gap-1.5">
                  <Zap className="size-4" fill="currentColor" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/ {plan.period}</span>
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <button
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular
                    ? "bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-105"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 text-white"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Check className={`size-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-sky-400' : 'text-gray-500'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400">
            All plans include a <span className="text-sky-400 font-semibold">14-day money-back guarantee</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
