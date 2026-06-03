import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export function EarlyAccess() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
  };
  
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-cyan-500/5" />
          <motion.div
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 size-96 bg-sky-500 rounded-full blur-3xl"
          />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="size-6 text-sky-500" />
              <span className="text-sm text-sky-500 font-semibold uppercase tracking-wider">Early Access</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center leading-tight">
              Be one of the first creators<br />to automate your workflow
            </h2>
            <p className="text-xl text-gray-400 mb-10 text-center max-w-2xl mx-auto">
              Join our early access program and help shape the future of streaming automation
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 rounded-xl bg-black/50 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all flex items-center justify-center gap-2 group hover:scale-105"
              >
                Join Waitlist
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              No credit card required • Early access is free
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}