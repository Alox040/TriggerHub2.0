import { motion } from "motion/react";
import { Radio, GitBranch, Music, Play, Settings } from "lucide-react";

export function EditorMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Glow effect - Updated to cyan/blue */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-sky-500/20 blur-3xl rounded-3xl" />
      
      {/* Editor window */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        {/* Title bar */}
        <div className="h-10 bg-zinc-900/50 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-yellow-500/80" />
            <div className="size-3 rounded-full bg-sky-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400 font-medium">Stream Automation Flow</span>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="h-12 bg-zinc-900/30 border-b border-white/5 flex items-center px-4 gap-3">
          <button className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium flex items-center gap-2 hover:bg-sky-500/20 transition-colors">
            <Play className="size-3" fill="currentColor" />
            Run
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:bg-white/10 transition-colors">
            Save
          </button>
          <div className="flex-1" />
          <Settings className="size-4 text-gray-500" />
        </div>
        
        {/* Canvas */}
        <div className="p-8 bg-[#0b0b0c] min-h-[400px] relative">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
          
          {/* Flow visualization */}
          <div className="relative flex items-center justify-center gap-8">
            {/* Node 1: Trigger */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-sky-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-48 p-4 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 rounded-lg bg-sky-500 flex items-center justify-center">
                    <Radio className="size-4 text-white" />
                  </div>
                  <span className="text-xs text-sky-400 font-medium">TRIGGER</span>
                </div>
                <div className="text-sm text-white font-medium mb-1">OBS Stream Started</div>
                <div className="text-xs text-gray-400">When stream goes live</div>
              </div>
              {/* Connection point */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-sky-500 border-2 border-zinc-950 shadow-lg shadow-sky-500/50" />
            </motion.div>
            
            {/* Animated connection line */}
            <svg width="80" height="2" className="overflow-visible">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <line x1="0" y1="1" x2="80" y2="1" stroke="url(#grad1)" strokeWidth="2" />
              <motion.circle
                cx="0"
                cy="1"
                r="3"
                fill="rgb(14, 165, 233)"
                initial={{ cx: 0 }}
                animate={{ cx: 80 }}
                transition={{
                  duration: 2,
                  delay: 0.7,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                filter="blur(1px)"
              />
            </svg>
            
            {/* Node 2: Condition */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-48 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                    <GitBranch className="size-4 text-white" />
                  </div>
                  <span className="text-xs text-cyan-400 font-medium">CONDITION</span>
                </div>
                <div className="text-sm text-white font-medium mb-1">If Scene = Gameplay</div>
                <div className="text-xs text-gray-400">Check active scene</div>
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-cyan-500 border-2 border-zinc-950 shadow-lg shadow-cyan-500/50" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-cyan-500 border-2 border-zinc-950 shadow-lg shadow-cyan-500/50" />
            </motion.div>
            
            {/* Animated connection line 2 */}
            <svg width="80" height="2" className="overflow-visible">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <line x1="0" y1="1" x2="80" y2="1" stroke="url(#grad2)" strokeWidth="2" />
              <motion.circle
                cx="0"
                cy="1"
                r="3"
                fill="rgb(6, 182, 212)"
                initial={{ cx: 0 }}
                animate={{ cx: 80 }}
                transition={{
                  duration: 2,
                  delay: 0.9,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                filter="blur(1px)"
              />
            </svg>
            
            {/* Node 3: Action */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-48 p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Music className="size-4 text-white" />
                  </div>
                  <span className="text-xs text-blue-400 font-medium">ACTION</span>
                </div>
                <div className="text-sm text-white font-medium mb-1">Play Spotify Playlist</div>
                <div className="text-xs text-gray-400">Start background music</div>
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-blue-500 border-2 border-zinc-950 shadow-lg shadow-blue-500/50" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}