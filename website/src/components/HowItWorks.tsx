import { motion } from "motion/react";
import { Zap, GitBranch, Sparkles, Radio, Music, Bell, Clapperboard } from "lucide-react";
import { ExpandableCard } from "./ExpandableCard";

export function HowItWorks() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Core Concepts</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            How TriggerHub Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple building blocks create powerful automation workflows
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ExpandableCard
              icon={<Zap className="size-7 text-white" />}
              title="Triggers"
              description="Events from your streaming tools, apps and platform that start automation workflows."
              color="green"
              expandedContent={
                <div className="space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Triggers are the starting point of any automation. They listen for specific events 
                    from your connected tools and kick off your workflow when conditions are met.
                  </p>
                  
                  <div className="rounded-xl bg-background border border-white/5 p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
                      Available Triggers
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Radio className="size-4 text-green-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">Stream Started</div>
                          <div className="text-xs text-gray-500">OBS</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Bell className="size-4 text-green-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">New Follower</div>
                          <div className="text-xs text-gray-500">Twitch</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Clapperboard className="size-4 text-green-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">Scene Changed</div>
                          <div className="text-xs text-gray-500">OBS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="text-xs text-green-400 font-semibold mb-1">Example Flow</div>
                    <div className="text-sm text-gray-300">
                      When <span className="text-white font-medium">Stream Started</span> → 
                      Then <span className="text-white font-medium">Execute Actions</span>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ExpandableCard
              icon={<GitBranch className="size-7 text-white" />}
              title="Conditions"
              description="Smart logic that determines when and how your automations should run."
              color="blue"
              expandedContent={
                <div className="space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Conditions add intelligent logic to your workflows. They check specific criteria 
                    before allowing actions to execute, giving you precise control over your automations.
                  </p>
                  
                  <div className="rounded-xl bg-background border border-white/5 p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
                      Condition Builder
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-xs text-blue-400 font-medium mb-2">IF CONDITION</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Scene</span>
                          <span className="text-blue-400">=</span>
                          <span className="text-white font-medium">Gameplay</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-xs text-blue-400 font-medium mb-2">AND</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Viewer count</span>
                          <span className="text-blue-400">&gt;</span>
                          <span className="text-white font-medium">50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      AND / OR Logic
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      Comparisons
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      Time-based
                    </span>
                  </div>
                </div>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ExpandableCard
              icon={<Sparkles className="size-7 text-white" />}
              title="Actions"
              description="Powerful operations that control your tools, apps and streaming setup."
              color="purple"
              expandedContent={
                <div className="space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Actions are the final step that makes your automation useful. They execute operations 
                    across your connected tools, from controlling OBS to managing audio playback.
                  </p>
                  
                  <div className="rounded-xl bg-background border border-white/5 p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
                      Popular Actions
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Music className="size-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">Play Playlist</div>
                          <div className="text-xs text-gray-500">Spotify</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Clapperboard className="size-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">Switch Scene</div>
                          <div className="text-xs text-gray-500">OBS</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Sparkles className="size-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">Send Notification</div>
                          <div className="text-xs text-gray-500">Discord</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <div className="text-xs text-purple-400 font-semibold mb-1">Multi-Step Actions</div>
                    <div className="text-sm text-gray-300">
                      Chain multiple actions together for complex workflows
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}