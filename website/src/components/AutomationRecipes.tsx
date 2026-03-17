import { motion } from "motion/react";
import { Radio, Clapperboard, Music, MessageSquare, Lightbulb, Video, ArrowRight } from "lucide-react";

const recipes = [
  {
    title: "Stream Start Intro",
    description: "A possible start-of-stream routine using OBS and Spotify once the full flow is configured.",
    slug: "stream-start-intro",
    trigger: { icon: Radio, label: "Stream Started", color: "sky" },
    condition: { icon: Clapperboard, label: "Scene = Starting Soon", color: "cyan" },
    action: { icon: Music, label: "Play Spotify Intro", color: "blue" },
  },
  {
    title: "Chat Command Clips",
    description: "Conceptual clip workflow based on chat commands; wiring to real chat platforms is not part of the current alpha.",
    slug: "chat-command-clips",
    trigger: { icon: MessageSquare, label: "!clip command", color: "sky" },
    condition: { icon: Clapperboard, label: "User is moderator", color: "cyan" },
    action: { icon: Video, label: "Create & Save Clip", color: "blue" },
  },
  {
    title: "Scene Light Control",
    description: "Concept idea for connecting OBS scene changes to external devices such as smart lights.",
    slug: "scene-light-control",
    trigger: { icon: Clapperboard, label: "Scene Changed", color: "sky" },
    condition: { icon: Clapperboard, label: "Scene = Gaming", color: "cyan" },
    action: { icon: Lightbulb, label: "Set Hue Lights Blue", color: "blue" },
  },
  {
    title: "Follower Thank You",
    description: "Illustrative example for reacting to follower events with notifications; external messaging integrations are not shipped today.",
    slug: "follower-thank-you",
    trigger: { icon: Radio, label: "New Follower", color: "sky" },
    condition: { icon: Clapperboard, label: "First-time follower", color: "cyan" },
    action: { icon: MessageSquare, label: "Send Discord DM", color: "blue" },
  },
  {
    title: "Auto Stream End",
    description: "A possible end-of-stream routine combining OBS scene changes and Spotify playback.",
    slug: "auto-stream-end",
    trigger: { icon: Radio, label: "End Stream Button", color: "sky" },
    condition: { icon: Clapperboard, label: "Stream > 1 hour", color: "cyan" },
    action: { icon: Music, label: "Fade Music & Switch", color: "blue" },
  },
  {
    title: "Raid Party Mode",
    description: "Future-focused idea for reacting to raid events with coordinated visuals and audio.",
    slug: "raid-party-mode",
    trigger: { icon: Radio, label: "Raid Started", color: "sky" },
    condition: { icon: Clapperboard, label: "Raiders > 50", color: "cyan" },
    action: { icon: Lightbulb, label: "Party Lights + Music", color: "blue" },
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
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">
            Concept recipes (not yet shipped)
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Example workflows for the TriggerHub model
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            These recipes show what is possible with the trigger, condition, and action system. They are not
            one-click templates or a live gallery in the current alpha.
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
              <div className="pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                  Concept-only example. These flows illustrate how creators might combine triggers, conditions, and
                  actions once the full runtime and integrations are configured.
                </span>
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
          <div className="text-sm text-gray-500 max-w-2xl mx-auto">
            Recipes and preset galleries are part of a later roadmap phase. The current alpha focuses on the
            underlying trigger, macro, and service modules rather than a public template library.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
