import { motion } from "motion/react";
import { Monitor, Music, MessageSquare, Video, Lightbulb, Gamepad2, Webhook, Twitch, ExternalLink } from "lucide-react";

const integrations = [
  {
    name: "OBS Studio",
    icon: Monitor,
    description: "Control scenes, sources, recording, and streaming with real-time automation",
    example: "Auto-switch scenes when stream starts",
    color: "from-red-500 to-orange-500",
    popular: true,
  },
  {
    name: "Spotify",
    icon: Music,
    description: "Manage playlists, control playback, and sync music with your stream events",
    example: "Play intro music on stream start",
    color: "from-green-500 to-emerald-500",
    popular: true,
  },
  {
    name: "Twitch",
    icon: Twitch,
    description: "React to followers, subs, raids, chat commands and channel point redeems",
    example: "Trigger effects on new follower",
    color: "from-purple-500 to-violet-500",
    popular: true,
  },
  {
    name: "Discord",
    icon: MessageSquare,
    description: "Send notifications, manage roles, and post updates to your community",
    example: "Notify Discord when stream goes live",
    color: "from-indigo-500 to-blue-500",
    popular: false,
  },
  {
    name: "YouTube",
    icon: Video,
    description: "Upload clips automatically, manage live streams, and update video metadata",
    example: "Auto-upload highlights to YouTube",
    color: "from-red-500 to-rose-500",
    popular: false,
  },
  {
    name: "Philips Hue",
    icon: Lightbulb,
    description: "Sync smart lights with scenes, events, and create immersive environments",
    example: "Change lights based on game scene",
    color: "from-cyan-500 to-blue-500",
    popular: false,
  },
  {
    name: "Stream Deck",
    icon: Gamepad2,
    description: "Trigger automations with physical buttons and customize deck layouts",
    example: "One-button multi-step workflows",
    color: "from-gray-500 to-slate-500",
    popular: false,
  },
  {
    name: "Webhooks",
    icon: Webhook,
    description: "Connect any external service or build custom integrations via API",
    example: "Integrate with any tool you use",
    color: "from-sky-500 to-cyan-500",
    popular: false,
  },
];

export function IntegrationLibrary() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Integrations</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Works with your favorite tools
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect OBS, Twitch, Spotify, Discord and 50+ creator tools in one automation platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`group relative p-6 rounded-2xl bg-zinc-950/50 border border-white/10 hover:border-sky-500/30 transition-all cursor-pointer ${
                integration.popular ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {integration.popular && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white text-xs font-semibold">
                  Popular
                </div>
              )}

              <div className="mb-4">
                <div className={`size-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <integration.icon className="size-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                  {integration.name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">
                  {integration.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-white/5 mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Example</div>
                <div className="text-sm text-gray-300 font-medium">{integration.example}</div>
              </div>

              <button className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 text-sm text-gray-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2 group/btn">
                View Integration
                <ExternalLink className="size-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border border-sky-500/20 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Need a custom integration?
          </h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Use our Webhook API or build your own plugin with the TriggerHub SDK
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all">
              View API Docs
            </button>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold transition-all hover:scale-105">
              Request Integration
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
