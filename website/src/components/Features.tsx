import { motion } from "motion/react";
import { Workflow, Plug, Puzzle, Zap, Clock, Monitor } from "lucide-react";
import { FeatureAccordion } from "./FeatureAccordion";

const features = [
  {
    icon: Workflow,
    title: "Visual Automation Editor",
    description: "Drag-and-drop interface to build complex workflows without code",
    expandedContent: {
      explanation: "Build sophisticated automation workflows using our intuitive visual editor. Connect triggers, conditions, and actions with simple drag-and-drop interactions. No coding required - just connect the dots.",
      example: "Trigger: Stream Started → Condition: Scene = Gaming → Action: Play Playlist",
      integrations: ["OBS", "Spotify", "Discord"],
    },
  },
  {
    icon: Plug,
    title: "Multi-Tool Integration",
    description: "Connect OBS, Spotify, Discord and your favorite creator tools",
    expandedContent: {
      explanation: "TriggerHub seamlessly connects with all major creator tools. Our integration engine allows real-time communication between your streaming software, music players, chat platforms, and more.",
      example: "Connect OBS scenes with Spotify playlists and Discord webhooks",
      integrations: ["OBS Studio", "Spotify", "Discord", "Twitch", "Stream Deck", "VoiceMeeter"],
    },
  },
  {
    icon: Puzzle,
    title: "Plugin System",
    description: "Extend functionality with community plugins and custom integrations",
    expandedContent: {
      explanation: "Our open plugin architecture lets you extend TriggerHub's capabilities. Install community-created plugins or build your own using our comprehensive SDK. The possibilities are endless.",
      example: "npm install @triggerhub/plugin-streamlabs",
      integrations: ["Plugin Marketplace", "Developer SDK", "Community Plugins"],
    },
  },
  {
    icon: Zap,
    title: "Creator Workflow Automation",
    description: "Built specifically for streamers and content creators",
    expandedContent: {
      explanation: "Unlike generic automation tools, TriggerHub is designed from the ground up for creator workflows. Every feature is optimized for streaming, content creation, and audience engagement.",
      example: "Auto-switch scenes, manage audio, trigger alerts, all in one platform",
      integrations: ["OBS", "Twitch", "YouTube", "Kick"],
    },
  },
  {
    icon: Clock,
    title: "Real Time Triggers",
    description: "Instant reactions to events with millisecond precision",
    expandedContent: {
      explanation: "TriggerHub operates in real-time with sub-100ms latency. Events trigger actions instantly, ensuring your automations feel responsive and professional. Perfect for live streaming where timing matters.",
      example: "New follower alert plays within 50ms of the follow event",
      integrations: ["Low-latency engine", "Event queuing", "Priority execution"],
    },
  },
  {
    icon: Monitor,
    title: "Local Desktop Control",
    description: "Runs locally on your machine with full system access",
    expandedContent: {
      explanation: "TriggerHub runs entirely on your local machine, giving it full access to control your streaming software and tools. No cloud delays, no privacy concerns - everything happens on your desktop.",
      example: "Direct control over OBS, audio devices, and system applications",
      integrations: ["Windows", "macOS", "Native integrations"],
    },
  },
];

export function Features() {
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
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Features</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Click any feature to learn more about how it works
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FeatureAccordion
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                expandedContent={feature.expandedContent}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}