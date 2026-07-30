"use client";

import { motion } from "framer-motion";
import {
  getHabitTitle,
  getHabitSubtitle,
  HabitDefinition,
} from "@/lib/habits";
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
  onTextChange?: (habitId: string, text: string | null) => void;
  onEveningRitual?: () => void;
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
  onTextChange,
  onEveningRitual,
}: HabitItemProps) {
  const title = getHabitTitle(habit, date);
  const subtitle = getHabitSubtitle(habit, date);
  const done = completion.completed;

  const handleClick = () => {
    if (habit.inputType === "evening_ritual" && !done) {
      onEveningRitual?.();
      return;
    }
    onToggle(habit.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{
        opacity: faded ? 0.4 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex gap-3 ${faded ? "py-2" : "py-3"}`}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <motion.button
          type="button"
          onClick={handleClick}
          whileTap={{ scale: 0.88 }}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums transition-all ${
            done
              ? "border-success bg-success/20 text-success"
              : "border-border bg-surface text-secondary hover:border-accent hover:text-accent hover:shadow-[0_0_12px_rgba(255,107,53,0.25)]"
          }`}
        >
          {done ? "✓" : habit.number}
        </motion.button>
        {!isLast && (
          <motion.div
            className={`mt-1 w-0.5 flex-1 min-h-[20px] rounded-full ${
              done ? "bg-success/40" : "bg-border"
            }`}
            layout
          />
        )}
      </div>

      {/* Card */}
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.99 }}
        className={`flex-1 rounded-2xl border px-4 py-3 text-left transition-colors ${
          done
            ? "border-success/20 bg-success/5"
            : "border-border bg-surface hover:border-accent/40 hover:bg-surface/80"
        } ${faded ? "opacity-80" : ""}`}
      >
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none">{habit.emoji}</span>
          <div className="min-w-0 flex-1">
            <p
              className={`font-bold leading-tight ${
                faded || done
                  ? "text-base text-secondary line-through decoration-secondary/30"
                  : "text-lg text-primary"
              }`}
            >
              {title}
            </p>
            {subtitle && !faded && (
              <p className="mt-1 text-xs leading-relaxed text-secondary">
                {subtitle}
              </p>
            )}

            {/* Weigh-in input */}
            {habit.inputType === "weight" && !faded && (
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-secondary">Weigh in:</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="—"
                  value={completion.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onWeightChange?.(
                      habit.id,
                      v === "" ? null : parseFloat(v)
                    );
                  }}
                  className="w-16 border-b-2 border-accent/50 bg-transparent py-0.5 text-lg font-bold tabular-nums text-primary outline-none focus:border-accent"
                />
                <span className="text-sm font-medium text-secondary">kg</span>
                {weightAverage != null && (
                  <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    7-day avg {weightAverage}
                  </span>
                )}
              </div>
            )}

            {/* Chore text input */}
            {habit.inputType === "text" && !faded && (
              <div
                className="mt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder="What's the chore today?"
                  value={completion.text ?? ""}
                  onChange={(e) =>
                    onTextChange?.(habit.id, e.target.value || null)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-primary placeholder:text-secondary/50 outline-none focus:border-accent"
                />
              </div>
            )}

            {/* Evening ritual steps */}
            {habit.inputType === "evening_ritual" && habit.ritualSteps && (
              <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                {habit.ritualSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-center gap-2 text-xs text-secondary"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        done ? "bg-success" : "bg-border"
                      }`}
                    />
                    {step}
                  </li>
                ))}
              </ul>
            )}

            {habit.inputType === "evening_ritual" && done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 rounded-lg bg-background px-3 py-2 text-xs font-medium text-success"
              >
                📵 Phone away — goodnight Matt
              </motion.p>
            )}

            {habit.inputType === "evening_ritual" && !done && !faded && (
              <p className="mt-2 text-xs font-medium text-accent">
                Tap to set tomorrow&apos;s intentions →
              </p>
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
