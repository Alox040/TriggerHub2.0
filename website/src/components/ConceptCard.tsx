import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ConceptCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  delay?: number;
  mockup: React.ReactNode;
}

export function ConceptCard({
  icon: Icon,
  label,
  title,
  description,
  color,
  gradientFrom,
  gradientTo,
  delay = 0,
  mockup,
}: ConceptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="relative h-full p-8 rounded-3xl bg-zinc-950/50 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`size-14 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
            <Icon className="size-7 text-white" />
          </div>
          <div>
            <div className={`text-xs font-semibold ${color} uppercase tracking-wider mb-1`}>
              {label}
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
        </div>
        
        <p className="text-gray-400 leading-relaxed mb-6">{description}</p>
        
        {/* Mockup */}
        <div className="rounded-xl bg-[#0b0b0c] border border-white/5 p-4 overflow-hidden">
          {mockup}
        </div>
      </div>
    </motion.div>
  );
}
