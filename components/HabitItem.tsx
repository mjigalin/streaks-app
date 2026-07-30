"use client";

import { motion } from "framer-motion";
import { getHabitLabel, HabitDefinition } from "@/lib/habits";
import { HabitCompletion } from "@/lib/completions";

interface HabitItemProps {
  habit: HabitDefinition;
  date: string;
  completion: HabitCompletion;
  isLast: boolean;
  faded?: boolean;
  weightAverage?: number | null;
  onToggle: (habitId: string) => void;
  onWeightChange?: (habitId: string, weight: number | null) => void;
}

export default function HabitItem({
  habit,
  date,
  completion,
  isLast,
  faded = false,
  weightAverage,
  onToggle,
  onWeightChange,
}: HabitItemProps) {
  const label = getHabitLabel(habit, date);
  const done = completion.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: faded ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, y: -24, height: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative flex gap-4 ${faded ? "py-2" : "py-4"}`}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors ${
            done
              ? "border-success/50 bg-success/20 text-success"
              : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
          }`}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        >
          {done ? "✓" : habit.number}
        </button>
        {!isLast && (
          <div
            className={`mt-1 w-px flex-1 min-h-[16px] ${
              done ? "bg-success/30" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={() => onToggle(habit.id)}
        className={`flex-1 text-left ${faded ? "line-through decoration-secondary/40" : ""}`}
      >
        <p
          className={`leading-snug ${
            faded
              ? "text-sm text-secondary"
              : done
                ? "text-secondary line-through"
                : "text-base text-primary"
          }`}
        >
          {label}
        </p>
        {habit.acceptsWeight && !faded && (
          <div
            className="mt-2 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="number"
              step="0.1"
              placeholder="kg"
              value={completion.value ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                onWeightChange?.(
                  habit.id,
                  v === "" ? null : parseFloat(v)
                );
              }}
              className="w-20 border-b border-border bg-transparent py-1 text-sm tabular-nums text-primary outline-none focus:border-accent"
            />
            <span className="text-xs text-secondary">kg today</span>
            {weightAverage !== null && weightAverage !== undefined && (
              <span className="text-xs text-accent">
                7-day avg: {weightAverage} kg
              </span>
            )}
          </div>
        )}
      </button>
    </motion.div>
  );
}
