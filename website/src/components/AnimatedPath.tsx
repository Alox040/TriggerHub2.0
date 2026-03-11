import { motion } from "motion/react";

interface AnimatedPathProps {
  delay?: number;
  vertical?: boolean;
}

export function AnimatedPath({ delay = 0, vertical = false }: AnimatedPathProps) {
  if (vertical) {
    return (
      <div className="relative flex justify-center my-4">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-green-500/30 to-transparent" />
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: [0, 1, 0], height: "100%" }}
          transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent"
        />
      </div>
    );
  }

  return (
    <div className="relative flex items-center px-4">
      <svg width="60" height="2" className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="1"
          x2="60"
          y2="1"
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        <motion.line
          x1="0"
          y1="1"
          x2="60"
          y2="1"
          stroke={`url(#gradient-${delay})`}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
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
    </div>
  );
}
