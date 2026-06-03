import { motion } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-sky-950/20 to-zinc-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-sky-500/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border border-sky-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="size-8 text-sky-400" fill="currentColor" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to automate?
            </h2>
          </div>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            TriggerHub is in controlled alpha. Request access to review the current desktop automation build.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2 group">
              Request Alpha Access
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 text-white font-semibold transition-all">
              Explore Recipes
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="size-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Controlled alpha access
            </div>
            <div className="flex items-center gap-2">
              <svg className="size-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Local desktop runtime
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
