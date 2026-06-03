import { motion } from "motion/react";
import { Radio, Clapperboard, Music, MessageSquare, Lightbulb, Video, ArrowRight, Copy, Eye } from "lucide-react";

const recipes = [
  {
    title: "Stream Start Intro",
    description: "Automatically play intro music and switch scenes when your stream goes live",
    slug: "stream-start-intro",
    trigger: { icon: Radio, label: "Stream Started", color: "sky" },
    condition: { icon: Clapperboard, label: "Scene = Starting Soon", color: "cyan" },
    action: { icon: Music, label: "Play Spotify Intro", color: "blue" },
    status: "Alpha pattern",
  },
  {
    title: "Chat Command Clips",
    description: "Let viewers create clips with a simple chat command for instant highlights",
    slug: "chat-command-clips",
    trigger: { icon: MessageSquare, label: "!clip command", color: "sky" },
    condition: { icon: Clapperboard, label: "User is moderator", color: "cyan" },
    action: { icon: Video, label: "Create & Save Clip", color: "blue" },
    status: "Concept",
  },
  {
    title: "Scene Light Control",
    description: "Sync your smart lights with OBS scenes for immersive stream environments",
    slug: "scene-light-control",
    trigger: { icon: Clapperboard, label: "Scene Changed", color: "sky" },
    condition: { icon: Clapperboard, label: "Scene = Gaming", color: "cyan" },
    action: { icon: Lightbulb, label: "Set Hue Lights Blue", color: "blue" },
    status: "Roadmap",
  },
  {
    title: "Follower Thank You",
    description: "Send personalized Discord messages when someone follows your channel",
    slug: "follower-thank-you",
    trigger: { icon: Radio, label: "New Follower", color: "sky" },
    condition: { icon: Clapperboard, label: "First-time follower", color: "cyan" },
    action: { icon: MessageSquare, label: "Send Discord DM", color: "blue" },
    status: "Concept",
  },
  {
    title: "Auto Stream End",
    description: "Gracefully end your stream with music fade and outro scene transition",
    slug: "auto-stream-end",
    trigger: { icon: Radio, label: "End Stream Button", color: "sky" },
    condition: { icon: Clapperboard, label: "Stream > 1 hour", color: "cyan" },
    action: { icon: Music, label: "Fade Music & Switch", color: "blue" },
    status: "Alpha pattern",
  },
  {
    title: "Raid Party Mode",
    description: "Trigger celebration effects when raiding another streamer's channel",
    slug: "raid-party-mode",
    trigger: { icon: Radio, label: "Raid Started", color: "sky" },
    condition: { icon: Clapperboard, label: "Raiders > 50", color: "cyan" },
    action: { icon: Lightbulb, label: "Party Lights + Music", color: "blue" },
    status: "Roadmap",
  },
];

export function AutomationRecipes() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Automation Recipes</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready-to-use workflow templates
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Review curated workflow patterns while TriggerHub remains in controlled alpha.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-zinc-950/50 border border-white/10 hover:border-sky-500/30 hover:bg-zinc-950/80 transition-all cursor-pointer"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Workflow Preview */}
              <div className="mb-4 p-4 rounded-xl bg-black/50 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`size-8 rounded-lg bg-${recipe.trigger.color}-500/20 flex items-center justify-center`}>
                    <recipe.trigger.icon className={`size-4 text-${recipe.trigger.color}-400`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Trigger</div>
                    <div className="text-xs text-white font-medium">{recipe.trigger.label}</div>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2" />
                
                <div className="flex items-center gap-2">
                  <div className={`size-8 rounded-lg bg-${recipe.action.color}-500/20 flex items-center justify-center`}>
                    <recipe.action.icon className={`size-4 text-${recipe.action.color}-400`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Action</div>
                    <div className="text-xs text-white font-medium">{recipe.action.label}</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                  <span className="text-sky-400 font-medium">{recipe.status}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 transition-all group/btn">
                    <Eye className="size-4 text-gray-400 group-hover/btn:text-sky-400 transition-colors" />
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/40 text-sky-400 text-xs font-medium transition-all flex items-center gap-1.5 group/btn">
                    <Copy className="size-3" />
                    <span className="group-hover/btn:translate-x-0.5 transition-transform">Copy</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 text-white font-medium transition-all flex items-center gap-2 mx-auto group">
            Browse All Recipes
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
