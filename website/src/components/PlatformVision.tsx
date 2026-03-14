import { motion, AnimatePresence } from "motion/react";
import { Blocks, Users, Code, Sparkles, ChevronDown, Package, Globe, Store } from "lucide-react";
import { useState } from "react";

export function PlatformVision() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-zinc-950 to-black overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-sky-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`p-12 rounded-3xl backdrop-blur-xl border transition-all ${
            isExpanded
              ? "bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border-sky-500/40 shadow-xl shadow-sky-500/10"
              : "bg-white/5 border-white/10"
          }`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="size-8 text-sky-500" />
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Platform Vision
              </h2>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sky-500"
              >
                <ChevronDown className="size-8" />
              </motion.div>
            </div>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              TriggerHub is evolving into the ultimate creator automation platform. 
              {!isExpanded && " Click to explore our vision for the future."}
            </p>
          </button>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-white/10">
                  <p className="text-lg text-gray-300 mb-12 leading-relaxed text-center">
                    We're building a thriving ecosystem where creators, developers, and plugin authors 
                    collaborate to build powerful integrations for the streaming community.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all group"
                    >
                      <Blocks className="size-8 text-sky-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-white mb-2 text-center">Plugin Marketplace</h3>
                      <p className="text-sm text-gray-400 text-center">Discover and install community plugins</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all group"
                    >
                      <Users className="size-8 text-sky-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-white mb-2 text-center">Creator Community</h3>
                      <p className="text-sm text-gray-400 text-center">Share workflows and learn from others</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all group"
                    >
                      <Code className="size-8 text-sky-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-white mb-2 text-center">Developer SDK</h3>
                      <p className="text-sm text-gray-400 text-center">Build custom integrations and plugins</p>
                    </motion.div>
                  </div>

                  {/* Future roadmap */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">Upcoming Features</h3>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-background border border-white/10"
                    >
                      <Package className="size-6 text-sky-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Plugin Store</h4>
                        <p className="text-sm text-gray-400">
                          Browse, install, and manage plugins directly from TriggerHub. One-click installation for instant automation expansion.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-background border border-white/10"
                    >
                      <Globe className="size-6 text-sky-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Cloud Sync</h4>
                        <p className="text-sm text-gray-400">
                          Sync your automation flows across devices. Edit on desktop, deploy on your streaming PC.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-background border border-white/10"
                    >
                      <Store className="size-6 text-sky-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Workflow Marketplace</h4>
                        <p className="text-sm text-gray-400">
                          Share your automations with the community. Discover and import pre-built workflows from top creators.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}