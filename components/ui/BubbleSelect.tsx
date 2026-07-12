"use client";

import { motion } from "framer-motion";

interface BubbleSelectProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}

export default function BubbleSelect<T extends string>({
  options,
  value,
  onChange,
}: BubbleSelectProps<T>) {
  return (
    <div className="flex justify-between gap-3">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(selected ? null : option.value)}
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
              selected
                ? "border-success bg-success text-white"
                : "border-border bg-transparent text-secondary hover:border-secondary"
            }`}
            whileTap={{ scale: 1.08 }}
            transition={{ duration: 0.2 }}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
