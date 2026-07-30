"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WeeklyGoal } from "@/lib/challenge";

interface WeeklyPromptProps {
  prompt: WeeklyGoal | null;
  onComplete: (goalId: string) => void;
  onDismiss: (promptId: string) => void;
  onLater: () => void;
}

export default function WeeklyPrompt({
  prompt,
  onComplete,
  onDismiss,
  onLater,
}: WeeklyPromptProps) {
  return (
    <AnimatePresence>
      {prompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Weekly goal
            </p>
            <h3 className="mt-2 text-lg font-semibold text-primary">
              {prompt.label}
            </h3>
            <p className="mt-2 text-sm text-secondary">{prompt.prompt}</p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onComplete(prompt.id)}
                className="w-full rounded-xl bg-success py-3 text-sm font-semibold text-white"
              >
                Yes, done!
              </button>
              <button
                type="button"
                onClick={() => onLater()}
                className="w-full rounded-xl border border-border py-3 text-sm text-secondary hover:text-primary"
              >
                Remind me later
              </button>
              <button
                type="button"
                onClick={() => onDismiss(prompt.id)}
                className="w-full py-2 text-xs text-secondary hover:text-primary"
              >
                Not this week
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
