import { motion } from "motion/react";
import { Play, ArrowRight } from "lucide-react";
import { projectStatus } from "../data/projectStatus";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 size-[600px] bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 size-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8">
            <div className="size-2 rounded-full bg-sky-400 animate-pulse" />
            <span>{projectStatus.statusLabel}</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
            {projectStatus.productName}<br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-sky-400 bg-clip-text text-transparent">
              project status portal
            </span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed"
        >
          Evidence-based product status from the main repository
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          {projectStatus.statusDescription}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <a href="#status" className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:scale-105 flex items-center gap-2 group">
            View Current Status
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#evidence" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold backdrop-blur-xl transition-all flex items-center gap-2">
            <Play className="size-5" fill="currentColor" />
            Review Evidence
          </a>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-8 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <svg className="size-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Updated: {projectStatus.updatedAt}
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Source of truth: project-context/website-status.json
          </div>
        </motion.div>
      </div>
    </section>
  );
}
