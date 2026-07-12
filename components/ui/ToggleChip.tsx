"use client";

import { motion } from "framer-motion";

interface ToggleChipProps {
  label: string;
  emoji: string;
  active: boolean;
  onToggle: () => void;
  activeColor?: "green" | "red";
}

export default function ToggleChip({
  label,
  emoji,
  active,
  onToggle,
  activeColor = "green",
}: ToggleChipProps) {
  const activeClass =
    activeColor === "red"
      ? "border-destructive bg-destructive text-white"
      : "border-success bg-success text-white";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={`flex min-h-[56px] flex-col items-center justify-center rounded-full border px-4 py-3 transition-colors ${
        active
          ? activeClass
          : "border-border bg-surface text-secondary hover:border-secondary"
      }`}
      whileTap={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-medium">{active ? "Yes" : "No"}</span>
      <span className="text-xs text-inherit opacity-80">{label}</span>
    </motion.button>
  );
}
