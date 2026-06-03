import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

interface FlowConnectorProps {
  delay?: number;
}

export function FlowConnector({ delay = 0 }: FlowConnectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center"
    >
      <ChevronRight className="size-6 text-gray-600" />
    </motion.div>
  );
}
