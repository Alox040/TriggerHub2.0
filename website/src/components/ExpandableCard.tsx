import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ExpandableCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  expandedContent: React.ReactNode;
  color?: string;
  defaultExpanded?: boolean;
}

export function ExpandableCard({
  icon,
  title,
  description,
  expandedContent,
  color = "green",
  defaultExpanded = false,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const colorClasses = {
    green: {
      gradient: "from-sky-500/20 to-cyan-600/10",
      border: "border-sky-500/30 hover:border-sky-500/50",
      activeBorder: "border-sky-500/60",
      glow: "shadow-sky-500/20",
      text: "text-sky-400",
      iconBg: "from-sky-500 to-cyan-600",
    },
    blue: {
      gradient: "from-cyan-500/20 to-blue-600/10",
      border: "border-cyan-500/30 hover:border-cyan-500/50",
      activeBorder: "border-cyan-500/60",
      glow: "shadow-cyan-500/20",
      text: "text-cyan-400",
      iconBg: "from-cyan-500 to-blue-600",
    },
    purple: {
      gradient: "from-blue-500/20 to-indigo-600/10",
      border: "border-blue-500/30 hover:border-blue-500/50",
      activeBorder: "border-blue-500/60",
      glow: "shadow-blue-500/20",
      text: "text-blue-400",
      iconBg: "from-blue-500 to-indigo-600",
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.green;

  return (
    <motion.div
      layout
      className={`relative rounded-3xl bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border transition-all ${
        isExpanded ? colors.activeBorder : colors.border
      } ${isExpanded ? `shadow-xl ${colors.glow}` : ""}`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 text-left flex items-start gap-4 group"
      >
        <div className={`size-14 rounded-2xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`${colors.text} flex-shrink-0`}
            >
              <ChevronDown className="size-6" />
            </motion.div>
          </div>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
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
            <div className="px-8 pb-8 pt-0 border-t border-white/10">
              <div className="pt-6">
                {expandedContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}