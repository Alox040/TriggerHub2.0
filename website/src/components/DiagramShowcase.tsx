import { motion } from "motion/react";
import { FlowDiagram } from "./FlowDiagram";

export function DiagramShowcase() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-black to-zinc-950">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[800px] bg-sky-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">
            Visual Automation
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Build flows visually
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Design complex automation workflows with an intuitive node-based editor. 
            Connect triggers, conditions and actions to create powerful creator automations.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FlowDiagram />
        </motion.div>
        
        {/* Feature highlights below diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="text-3xl font-bold text-sky-500 mb-2">Real-time</div>
            <p className="text-sm text-gray-400">
              Flows execute instantly as events happen across your streaming setup
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="text-3xl font-bold text-sky-500 mb-2">No Code</div>
            <p className="text-sm text-gray-400">
              Visual editor makes automation accessible to everyone
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="text-3xl font-bold text-sky-500 mb-2">Unlimited</div>
            <p className="text-sm text-gray-400">
              Create as many flows as you need for your complete workflow
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}