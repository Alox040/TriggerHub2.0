import { motion } from "motion/react";
import { Radio, Clapperboard, Music, Clock, ArrowRight } from "lucide-react";

const workflows = [
  {
    title: "Stream start (concept example)",
    description: "An example of how an OBS- and Spotify-based workflow could look once fully wired.",
    trigger: {
      icon: Radio,
      title: "OBS Stream Started",
      description: "Detects when broadcast begins",
    },
    conditions: [
      {
        icon: Clapperboard,
        title: "Scene = Starting Soon",
        description: "Verifies correct starting scene",
      },
      {
        icon: Clock,
        title: "Time between 6PM - 11PM",
        description: "Only during evening streams",
      },
    ],
    actions: [
      {
        icon: Music,
        title: "Play Spotify playlist (alpha)",
        description: "Start a curated intro playlist using the experimental Spotify adapter.",
      },
      {
        icon: Clapperboard,
        title: "Switch Scene after 30s",
        description: "Transition to the main scene after the intro window, assuming the trigger and conditions pass.",
      },
    ],
  },
];

export function WorkflowDemo() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-zinc-950 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">
            Example workflow sketch
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Visualizing an alpha-level stream flow
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            This mockup illustrates the trigger → conditions → actions model used in TriggerHub; it is not a
            gallery of live, production presets.
          </p>
        </motion.div>

        {workflows.map((workflow, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-3xl bg-zinc-950/50 border border-white/10 hover:border-sky-500/20 transition-all"
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-3">{workflow.title}</h3>
              <p className="text-lg text-gray-400">{workflow.description}</p>
            </div>

            <div className="space-y-8">
              {/* Trigger */}
              <div>
                <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-4">
                  Trigger
                </div>
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-600/5 border border-sky-500/20">
                  <div className="size-12 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <workflow.trigger.icon className="size-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {workflow.trigger.title}
                    </h4>
                    <p className="text-sm text-gray-400">{workflow.trigger.description}</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="size-6 text-gray-600" />
              </div>

              {/* Conditions */}
              <div>
                <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-4">Conditions</div>
                <div className="grid md:grid-cols-2 gap-4">
                  {workflow.conditions.map((condition, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20"
                    >
                      <div className="size-12 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0">
                        <condition.icon className="size-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1">
                          {condition.title}
                        </h4>
                        <p className="text-sm text-gray-400">{condition.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="size-6 text-gray-600" />
              </div>

              {/* Actions */}
              <div>
                <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-4">Actions</div>
                <div className="space-y-3">
                  {workflow.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                    >
                      <div className="size-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <action.icon className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-white mb-1">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-400">{action.description}</p>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        Step {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              This workflow is an illustrative example only. It reflects how triggers, conditions, and actions can
              be composed once the full desktop runtime and external integrations are configured.
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
