import { motion } from "motion/react";
import { Monitor, Music, MessageSquare, Gamepad2, Zap, Scissors } from "lucide-react";

const integrations = [
  { icon: Monitor, name: "OBS", color: "from-red-500 to-orange-500", angle: 0 },
  { icon: Music, name: "Spotify", color: "from-sky-500 to-cyan-500", angle: 60 },
  { icon: MessageSquare, name: "Discord", color: "from-indigo-500 to-blue-500", angle: 120 },
  { icon: Gamepad2, name: "Stream Deck", color: "from-purple-500 to-pink-500", angle: 180 },
  { icon: Scissors, name: "Clipper", color: "from-yellow-500 to-orange-500", angle: 240 },
  { icon: Zap, name: "Plugins", color: "from-cyan-500 to-blue-500", angle: 300 },
];

export function IntegrationHub() {
  const radius = 140;
  
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Integrations</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Connect your entire setup
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            TriggerHub integrates with all your favorite creator tools
          </p>
        </motion.div>
        
        <div className="relative flex items-center justify-center min-h-[400px]">
          {/* Center hub */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="absolute inset-0 bg-sky-500 rounded-full blur-2xl opacity-30" />
            <div className="relative size-24 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center border-4 border-zinc-950 shadow-2xl">
              <Zap className="size-12 text-white" fill="currentColor" />
            </div>
          </motion.div>
          
          {/* Connected integrations */}
          {integrations.map((integration, index) => {
            const x = Math.cos((integration.angle * Math.PI) / 180) * radius;
            const y = Math.sin((integration.angle * Math.PI) / 180) * radius;
            
            return (
              <div key={integration.name}>
                {/* Connection line */}
                <motion.svg
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none"
                  style={{ width: radius * 2, height: radius * 2 }}
                >
                  <defs>
                    <linearGradient id={`integration-grad-${index}`}>
                      <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line
                    x1={radius}
                    y1={radius}
                    x2={radius + x}
                    y2={radius + y}
                    stroke={`url(#integration-grad-${index})`}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Animated particle */}
                  <motion.circle
                    cx={radius}
                    cy={radius}
                    r="2"
                    fill="rgb(34, 211, 238)"
                    animate={{
                      cx: [radius, radius + x],
                      cy: [radius, radius + y],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5 + index * 0.3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                </motion.svg>
                
                {/* Integration icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="absolute top-1/2 left-1/2 group cursor-pointer"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${integration.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className="relative p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 group-hover:border-white/30 transition-all">
                    <div className={`size-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <integration.icon className="size-6 text-white" />
                    </div>
                    <div className="text-xs text-gray-400 font-medium text-center whitespace-nowrap">
                      {integration.name}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}