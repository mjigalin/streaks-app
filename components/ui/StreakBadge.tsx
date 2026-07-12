"use client";

import { motion } from "framer-motion";

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  if (count < 1) return null;

  return (
    <motion.span
      className="inline-flex items-center gap-1 text-sm font-medium text-accent"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="streak-flame">🔥</span>
      <span className="tabular-nums">{count}</span>
    </motion.span>
  );
}
