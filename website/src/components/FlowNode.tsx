import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface FlowNodeProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  color: string;
  delay?: number;
}

export function FlowNode({ icon: Icon, title, subtitle, color, delay = 0 }: FlowNodeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className={`absolute inset-0 ${color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      <div className="relative px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="size-5 text-black" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{title}</div>
            {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
