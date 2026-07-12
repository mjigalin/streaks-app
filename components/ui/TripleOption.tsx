"use client";

import { motion } from "framer-motion";

interface TripleOptionProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}

export default function TripleOption<T extends string>({
  options,
  value,
  onChange,
}: TripleOptionProps<T>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(selected ? null : option.value)}
            className={`min-h-[44px] rounded-xl px-2 py-3 text-sm font-medium transition-colors ${
              selected
                ? "bg-success text-white"
                : "border border-border bg-surface text-secondary hover:border-secondary"
            }`}
            whileTap={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
