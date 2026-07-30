"use client";

import { motion } from "framer-motion";
import { DailyIntentions } from "@/lib/intentions";

interface MorningIntentionsCardProps {
  intentions: DailyIntentions;
  onDismiss?: () => void;
}

export default function MorningIntentionsCard({
  intentions,
  onDismiss,
}: MorningIntentionsCardProps) {
  const hasContent =
    intentions.tomorrow_chore ||
    intentions.tomorrow_workout ||
    intentions.work_brain_dump ||
    intentions.personal_todos;

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-surface"
    >
      <div className="flex items-start justify-between px-4 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            ☀️ From last night
          </p>
          <h2 className="mt-1 text-lg font-bold text-primary">
            Today&apos;s intentions
          </h2>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-secondary hover:text-primary"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3 px-4 py-4">
        {(intentions.tomorrow_chore || intentions.tomorrow_workout) && (
          <div className="rounded-xl bg-background/60 px-3 py-2.5">
            <p className="text-xs font-medium text-secondary">Today&apos;s plan</p>
            {intentions.tomorrow_chore && (
              <p className="mt-1 text-sm text-primary">
                🔨 {intentions.tomorrow_chore}
              </p>
            )}
            {intentions.tomorrow_workout && (
              <p className="mt-1 text-sm text-primary">
                🏋️ {intentions.tomorrow_workout}
              </p>
            )}
          </div>
        )}

        {intentions.work_brain_dump && (
          <div className="rounded-xl bg-background/60 px-3 py-2.5">
            <p className="text-xs font-medium text-secondary">Work</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
              {intentions.work_brain_dump}
            </p>
          </div>
        )}

        {intentions.personal_todos && (
          <div className="rounded-xl bg-background/60 px-3 py-2.5">
            <p className="text-xs font-medium text-secondary">Personal</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
              {intentions.personal_todos}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
