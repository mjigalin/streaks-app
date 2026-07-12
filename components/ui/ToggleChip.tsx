"use client";

import { motion } from "framer-motion";

type ChipState = "unset" | "good" | "bad";

interface ToggleChipProps {
  emoji: string;
  categoryLabel: string;
  value: number | null;
  goodValue: 0 | 1;
  goodLabel: string;
  badLabel: string;
  onChange: (value: number | null) => void;
}

function getChipState(value: number | null, goodValue: 0 | 1): ChipState {
  if (value === null) return "unset";
  return value === goodValue ? "good" : "bad";
}

export default function ToggleChip({
  emoji,
  categoryLabel,
  value,
  goodValue,
  goodLabel,
  badLabel,
  onChange,
}: ToggleChipProps) {
  const state = getChipState(value, goodValue);
  const displayLabel =
    state === "good" ? goodLabel : state === "bad" ? badLabel : "Tap to log";

  const stateClass =
    state === "good"
      ? "border-success bg-success text-white"
      : state === "bad"
        ? "border-destructive bg-destructive text-white"
        : "border-border bg-surface text-secondary hover:border-secondary";

  return (
    <motion.button
      type="button"
      onClick={() => onChange(cycleValue(value, goodValue))}
      className={`flex min-h-[72px] flex-col items-center justify-center rounded-full border px-3 py-3 transition-colors ${stateClass}`}
      whileTap={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-medium leading-tight">{displayLabel}</span>
      <span className="text-xs opacity-80">{categoryLabel}</span>
    </motion.button>
  );
}

function cycleValue(current: number | null, goodValue: 0 | 1): number | null {
  if (current === null) return goodValue;
  const badValue = goodValue === 0 ? 1 : 0;
  if (current === goodValue) return badValue;
  return null;
}
