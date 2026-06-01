"use client";

import { motion } from "framer-motion";

const DOTS = [
  // row 1
  { cx: 8,  cy: 8,  delay: 0.0 },
  { cx: 22, cy: 8,  delay: 0.1 },
  { cx: 36, cy: 8,  delay: 0.2 },
  // row 2
  { cx: 8,  cy: 22, delay: 0.15 },
  { cx: 22, cy: 22, delay: 0.25 },
  // row 3
  { cx: 8,  cy: 36, delay: 0.3 },
  { cx: 22, cy: 36, delay: 0.4 },
  { cx: 36, cy: 36, delay: 0.5 },
];

const LINES = [
  { x1: 8,  y1: 8,  x2: 22, y2: 22, delay: 0.05 },
  { x1: 22, y1: 8,  x2: 36, y2: 8,  delay: 0.15 },
  { x1: 22, y1: 22, x2: 8,  y2: 36, delay: 0.3  },
  { x1: 22, y1: 22, x2: 36, y2: 36, delay: 0.4  },
];

export function MasidyAnimatedIcon({
  size = 44,
  animate = true,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 44 44"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lines first (behind dots) */}
      {LINES.map((line, i) => (
        <motion.line
          animate={animate ? {
            opacity: [0.3, 1, 0.3],
            pathLength: [0.5, 1, 0.5],
          } : { opacity: 1 }}
          initial={{ opacity: 0.5 }}
          key={`line-${i}`}
          stroke="#F97316"
          strokeLinecap="round"
          strokeWidth="2.5"
          transition={animate ? {
            delay: line.delay,
            duration: 1.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          } : {}}
          x1={line.x1}
          x2={line.x2}
          y1={line.y1}
          y2={line.y2}
        />
      ))}

      {/* Dots */}
      {DOTS.map((dot, i) => (
        <motion.circle
          animate={animate ? {
            scale: [1, 1.35, 1],
            opacity: [0.6, 1, 0.6],
          } : { scale: 1, opacity: 1 }}
          cx={dot.cx}
          cy={dot.cy}
          fill="#F97316"
          initial={{ scale: 1, opacity: 0.8 }}
          key={`dot-${i}`}
          r="5"
          transition={animate ? {
            delay: dot.delay,
            duration: 1.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          } : {}}
        />
      ))}
    </svg>
  );
}
