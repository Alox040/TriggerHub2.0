import { motion } from "motion/react";
import { X, Check } from "lucide-react";

const problems = [
  "Manually switching scenes during your stream",
  "Forgetting to start your intro music",
  "Missing follower alerts while focused on gameplay",
  "Repeating the same setup actions every stream",
];

const solutions = [
  "Automate scene transitions based on events",
  "Trigger music automatically when stream starts",
  "Real-time alerts with zero manual intervention",
  "One-click workflow that runs every time",
];

export function ProblemSection() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">The Problem</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Streaming shouldn't feel like work
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            You're focused on creating content, not clicking buttons and managing tools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without TriggerHub */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <X className="size-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Without Automation</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 text-gray-400"
                >
                  <X className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{problem}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* With TriggerHub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border border-sky-500/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Check className="size-5 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">With TriggerHub</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <Check className="size-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>{solution}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-300">
            TriggerHub is currently prepared for a controlled alpha. No public user numbers or social-proof claims are published.
          </p>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:scale-105">
            Request Alpha Access
          </button>
        </motion.div>
      </div>
    </section>
  );
}
