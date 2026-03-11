import { motion, AnimatePresence } from "motion/react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { useState } from "react";

interface FeatureAccordionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  expandedContent?: {
    explanation: string;
    example: string;
    integrations: string[];
  };
}

export function FeatureAccordion({ icon: Icon, title, description, expandedContent }: FeatureAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`relative rounded-2xl backdrop-blur-xl border transition-all cursor-pointer ${
        isExpanded
          ? "bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border-sky-500/40 shadow-lg shadow-sky-500/10"
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact view */}
      <div className="p-6 flex items-start gap-4">
        <div className={`size-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center flex-shrink-0 transition-transform ${
          isExpanded ? "scale-110" : "group-hover:scale-105"
        }`}>
          <Icon className="size-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400 flex-shrink-0"
            >
              <ChevronRight className="size-5" />
            </motion.div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 border-t border-sky-500/20">
              <div className="pt-4 space-y-4">
                {/* Detailed explanation */}
                <div>
                  <h4 className="text-sm font-semibold text-sky-400 mb-2 uppercase tracking-wide">
                    How it works
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {expandedContent.explanation}
                  </p>
                </div>

                {/* Example */}
                <div className="p-4 rounded-xl bg-[#0b0b0c] border border-white/10">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    Example
                  </h4>
                  <p className="text-sm text-gray-300 font-mono">
                    {expandedContent.example}
                  </p>
                </div>

                {/* Integrations */}
                {expandedContent.integrations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Works with
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expandedContent.integrations.map((integration) => (
                        <span
                          key={integration}
                          className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300"
                        >
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}