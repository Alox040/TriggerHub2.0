import { motion } from "motion/react";
import { 
  Radio, 
  GitBranch, 
  Music, 
  Heart, 
  Volume2, 
  MessageSquare, 
  Scissors, 
  Save, 
  Send,
  Clapperboard,
  MonitorStop,
  Presentation
} from "lucide-react";

interface NodeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: "trigger" | "condition" | "action";
  delay?: number;
  x: number;
  y: number;
  scale?: number;
}

function FlowNode({ icon, title, description, type, delay = 0, x, y, scale = 1 }: NodeProps) {
  const colors = {
    trigger: {
      bg: "from-green-500/20 to-green-600/10",
      border: "border-green-500/30",
      glow: "bg-green-500",
      text: "text-green-400",
      iconBg: "bg-green-500",
    },
    condition: {
      bg: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
      glow: "bg-blue-500",
      text: "text-blue-400",
      iconBg: "bg-blue-500",
    },
    action: {
      bg: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/30",
      glow: "bg-purple-500",
      text: "text-purple-400",
      iconBg: "bg-purple-500",
    },
  };

  const color = colors[type];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: scale, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="absolute"
      style={{ left: x, top: y }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 ${color.glow} rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      
      {/* Node card */}
      <div className={`relative w-64 p-4 rounded-xl bg-gradient-to-br ${color.bg} border ${color.border} backdrop-blur-sm hover:border-opacity-60 transition-all group cursor-pointer`}>
        <div className="flex items-start gap-3 mb-2">
          <div className={`size-10 rounded-lg ${color.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-bold ${color.text} uppercase tracking-wider mb-1`}>
              {type}
            </div>
            <div className="text-sm text-white font-semibold leading-tight">{title}</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 leading-relaxed pl-13">
          {description}
        </div>
        
        {/* Connection dots */}
        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 size-3 rounded-full ${color.glow} border-2 border-background shadow-lg z-10`} />
        <div className={`absolute -left-2 top-1/2 -translate-y-1/2 size-3 rounded-full ${color.glow} border-2 border-background shadow-lg z-10`} />
      </div>
    </motion.div>
  );
}

interface ConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay?: number;
  color?: string;
}

function Connection({ x1, y1, x2, y2, delay = 0, color = "rgb(34, 197, 94)" }: ConnectionProps) {
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  return (
    <svg className="absolute inset-0 overflow-visible pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`gradient-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="50%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
        <filter id={`glow-${x1}-${y1}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Static line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeDasharray="4 4"
      />
      
      {/* Animated glow line */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#gradient-${x1}-${y1})`}
        strokeWidth="2"
        filter={`url(#glow-${x1}-${y1})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
      />
      
      {/* Animated particle */}
      <motion.circle
        cx={x1}
        cy={y1}
        r="3"
        fill={color}
        filter={`url(#glow-${x1}-${y1})`}
        initial={{ cx: x1, cy: y1 }}
        animate={{ 
          cx: x2,
          cy: y2,
        }}
        transition={{
          duration: 2,
          delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

export function FlowDiagram() {
  return (
    <div className="relative w-full h-[800px] rounded-2xl bg-background border border-white/10 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 size-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 size-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Main flow - centered */}
      <FlowNode
        icon={<Radio className="size-5 text-white" />}
        title="OBS Stream Started"
        description="Event detected when stream goes live"
        type="trigger"
        delay={0.2}
        x={50}
        y={320}
        scale={1.1}
      />
      
      <FlowNode
        icon={<GitBranch className="size-5 text-white" />}
        title="Scene = Gameplay"
        description="Only continue if active scene is Gameplay"
        type="condition"
        delay={0.4}
        x={380}
        y={320}
        scale={1.1}
      />
      
      <FlowNode
        icon={<Music className="size-5 text-white" />}
        title="Start Spotify Playlist"
        description="Automatically start background music"
        type="action"
        delay={0.6}
        x={710}
        y={320}
        scale={1.1}
      />
      
      {/* Connection lines for main flow */}
      <Connection x1={314} y1={368} x2={380} y2={368} delay={0.5} />
      <Connection x1={644} y1={368} x2={710} y2={368} delay={0.7} />
      
      {/* Top flow - New Follower */}
      <FlowNode
        icon={<Heart className="size-4 text-white" />}
        title="New Follower"
        description="Twitch follower event"
        type="trigger"
        delay={0.8}
        x={80}
        y={80}
        scale={0.85}
      />
      
      <FlowNode
        icon={<Volume2 className="size-4 text-white" />}
        title="Trigger Alert Sound"
        description="Play notification"
        type="action"
        delay={1.0}
        x={410}
        y={80}
        scale={0.85}
      />
      
      <FlowNode
        icon={<MessageSquare className="size-4 text-white" />}
        title="Highlight Chat"
        description="Show in overlay"
        type="action"
        delay={1.2}
        x={740}
        y={80}
        scale={0.85}
      />
      
      {/* Connections for top flow */}
      <Connection x1={344} y1={128} x2={410} y2={128} delay={0.9} color="rgb(239, 68, 68)" />
      <Connection x1={674} y1={128} x2={740} y2={128} delay={1.1} color="rgb(239, 68, 68)" />
      
      {/* Bottom flow - Clip Created */}
      <FlowNode
        icon={<Scissors className="size-4 text-white" />}
        title="Clip Created"
        description="New clip saved"
        type="trigger"
        delay={1.4}
        x={80}
        y={580}
        scale={0.85}
      />
      
      <FlowNode
        icon={<Save className="size-4 text-white" />}
        title="Save Locally"
        description="Store to disk"
        type="action"
        delay={1.6}
        x={410}
        y={580}
        scale={0.85}
      />
      
      <FlowNode
        icon={<Send className="size-4 text-white" />}
        title="Send to Editor"
        description="Discord notification"
        type="action"
        delay={1.8}
        x={740}
        y={580}
        scale={0.85}
      />
      
      {/* Connections for bottom flow */}
      <Connection x1={344} y1={628} x2={410} y2={628} delay={1.5} color="rgb(34, 197, 94)" />
      <Connection x1={674} y1={628} x2={740} y2={628} delay={1.7} color="rgb(34, 197, 94)" />
      
      {/* Right side flow - Stream Ending */}
      <FlowNode
        icon={<MonitorStop className="size-4 text-white" />}
        title="Stream Ending"
        description="5 minutes before end"
        type="trigger"
        delay={2.0}
        x={1050}
        y={200}
        scale={0.75}
      />
      
      <FlowNode
        icon={<Music className="size-4 text-white" />}
        title="Stop Music"
        description="Fade out audio"
        type="action"
        delay={2.2}
        x={1050}
        y={360}
        scale={0.75}
      />
      
      <FlowNode
        icon={<Presentation className="size-4 text-white" />}
        title="Switch to Outro"
        description="Change OBS scene"
        type="action"
        delay={2.4}
        x={1050}
        y={520}
        scale={0.75}
      />
      
      {/* Vertical connections for right flow */}
      <Connection x1={1182} y1={248} x2={1182} y2={360} delay={2.1} color="rgb(59, 130, 246)" />
      <Connection x1={1182} y1={408} x2={1182} y2={520} delay={2.3} color="rgb(59, 130, 246)" />
      
      {/* Decorative info label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6 }}
        className="absolute bottom-6 left-6 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="text-xs text-gray-400">
          <span className="text-green-500 font-semibold">4 Active Flows</span> • Real-time automation
        </div>
      </motion.div>
      
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
        className="absolute bottom-6 right-6 flex items-center gap-6 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400">Trigger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-400">Condition</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-purple-500" />
          <span className="text-xs text-gray-400">Action</span>
        </div>
      </motion.div>
    </div>
  );
}
