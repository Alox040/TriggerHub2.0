import { motion, AnimatePresence } from "motion/react";
import { Radio, Clapperboard, Music, Heart, Volume2, MessageSquare, Scissors, Save, Send, ChevronDown } from "lucide-react";
import { useState } from "react";

const automations = [
  {
    title: "Stream Workflow",
    description: "Automate your stream start sequence",
    steps: [
      { icon: Radio, label: "Stream Start", color: "bg-green-500", textColor: "text-green-400" },
      { icon: Clapperboard, label: "Switch Scene", color: "bg-blue-500", textColor: "text-blue-400" },
      { icon: Music, label: "Start Music", color: "bg-purple-500", textColor: "text-purple-400" },
    ],
    details: "This automation detects when your stream goes live, automatically switches to your gameplay scene, and starts your curated Spotify playlist - all without manual intervention.",
  },
  {
    title: "Engagement Alert",
    description: "Celebrate new followers in real-time",
    steps: [
      { icon: Heart, label: "New Follower", color: "bg-red-500", textColor: "text-red-400" },
      { icon: Volume2, label: "Trigger Sound", color: "bg-orange-500", textColor: "text-orange-400" },
      { icon: MessageSquare, label: "Highlight Chat", color: "bg-pink-500", textColor: "text-pink-400" },
    ],
    details: "When someone follows your channel, instantly play a celebration sound and highlight their message in chat with a custom overlay animation.",
  },
  {
    title: "Content Pipeline",
    description: "Streamline your clip workflow",
    steps: [
      { icon: Scissors, label: "Clip Created", color: "bg-cyan-500", textColor: "text-cyan-400" },
      { icon: Save, label: "Save Locally", color: "bg-indigo-500", textColor: "text-indigo-400" },
      { icon: Send, label: "Send to Editor", color: "bg-violet-500", textColor: "text-violet-400" },
    ],
    details: "Automatically save clips to your local drive and send a Discord notification to your editor with the clip details and timestamp.",
  },
];

function ExpandableAutomationCard({ automation, index }: { automation: typeof automations[0], index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative rounded-3xl backdrop-blur-xl border transition-all ${
        isExpanded
          ? "bg-zinc-950/70 border-sky-500/40 shadow-xl shadow-sky-500/10"
          : "bg-zinc-950/50 border-white/10 hover:border-white/20"
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 text-left"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              {automation.title}
            </div>
            <p className="text-gray-400 text-sm">{automation.description}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-sky-500 flex-shrink-0"
          >
            <ChevronDown className="size-6" />
          </motion.div>
        </div>

        {/* Compact flow preview */}
        {!isExpanded && (
          <div className="flex items-center gap-3 flex-wrap">
            {automation.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`size-10 rounded-lg ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="size-5 text-white" />
                </div>
                {idx < automation.steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-gray-600 to-gray-700" />
                )}
              </div>
            ))}
          </div>
        )}
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
            <div className="px-8 pb-8 border-t border-white/10">
              <div className="pt-6 space-y-6">
                {/* Detailed explanation */}
                <p className="text-sm text-gray-300 leading-relaxed">
                  {automation.details}
                </p>

                {/* Full flow diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-0">
                  {automation.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center w-full md:w-auto">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                        className="relative flex-1 md:flex-initial"
                      >
                        {/* Glow effect */}
                        <div className={`absolute inset-0 ${step.color} rounded-2xl blur-xl opacity-30`} />
                        
                        {/* Node card */}
                        <div className="relative p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-white/10 min-w-[200px]">
                          <div className="flex flex-col items-center gap-3">
                            <div className={`size-14 rounded-xl ${step.color} flex items-center justify-center shadow-lg shadow-black/50`}>
                              <step.icon className="size-7 text-white" />
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-semibold ${step.textColor} mb-1`}>
                                {step.label}
                              </div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                {stepIndex === 0 ? 'Trigger' : stepIndex === automation.steps.length - 1 ? 'Action' : 'Action'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Connection dots */}
                          {stepIndex < automation.steps.length - 1 && (
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 size-3 rounded-full bg-sky-500 border-2 border-zinc-950 shadow-lg shadow-sky-500/50 z-10" />
                          )}
                          {stepIndex > 0 && (
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 size-3 rounded-full bg-sky-500 border-2 border-zinc-950 shadow-lg shadow-sky-500/50 z-10" />
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Connection line */}
                      {stepIndex < automation.steps.length - 1 && (
                        <div className="hidden md:block relative w-16 h-0.5 bg-gradient-to-r from-sky-500/50 to-sky-500/50">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AutomationExamples() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Visual Workflows</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Automation in Action
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Click to explore complete automation workflows
          </p>
        </motion.div>
        
        <div className="space-y-6">
          {automations.map((automation, index) => (
            <ExpandableAutomationCard
              key={index}
              automation={automation}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}