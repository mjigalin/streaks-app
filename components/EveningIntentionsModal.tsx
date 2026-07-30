"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays } from "@/lib/dates";
import { getHabitTitle, getHabitById } from "@/lib/habits";

interface EveningIntentionsModalProps {
  open: boolean;
  date: string;
  onClose: () => void;
  onSave: (data: {
    tomorrow_chore: string;
    tomorrow_workout: string;
    work_brain_dump: string;
    personal_todos: string;
  }) => void;
}

export default function EveningIntentionsModal({
  open,
  date,
  onClose,
  onSave,
}: EveningIntentionsModalProps) {
  const tomorrowStr = addDays(date, 1);
  const workoutHabit = getHabitById("workout");
  const defaultWorkout = workoutHabit
    ? getHabitTitle(workoutHabit, tomorrowStr)
    : "";

  const [tomorrowChore, setTomorrowChore] = useState("");
  const [tomorrowWorkout, setTomorrowWorkout] = useState(defaultWorkout);
  const [workBrainDump, setWorkBrainDump] = useState("");
  const [personalTodos, setPersonalTodos] = useState("");

  const handleSave = () => {
    onSave({
      tomorrow_chore: tomorrowChore,
      tomorrow_workout: tomorrowWorkout,
      work_brain_dump: workBrainDump,
      personal_todos: personalTodos,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="sticky top-0 border-b border-border bg-surface px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                🌙 Evening Ritual
              </p>
              <h2 className="mt-1 text-xl font-bold text-primary">
                Tomorrow&apos;s Intentions
              </h2>
              <p className="mt-1 text-xs text-secondary">
                Set up tomorrow, then phone goes away for the night
              </p>
            </div>

            <div className="space-y-5 px-5 py-5">
              <section>
                <label className="mb-2 block text-sm font-semibold text-primary">
                  1 · Tomorrow&apos;s plan
                </label>
                <input
                  type="text"
                  placeholder="Meaningful chore for tomorrow"
                  value={tomorrowChore}
                  onChange={(e) => setTomorrowChore(e.target.value)}
                  className="mb-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Workout plan"
                  value={tomorrowWorkout}
                  onChange={(e) => setTomorrowWorkout(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </section>

              <section>
                <label className="mb-2 block text-sm font-semibold text-primary">
                  2 · Work brain dump
                </label>
                <textarea
                  placeholder="Anything on your mind for work…"
                  value={workBrainDump}
                  onChange={(e) => setWorkBrainDump(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </section>

              <section>
                <label className="mb-2 block text-sm font-semibold text-primary">
                  3 · Personal todos
                </label>
                <textarea
                  placeholder="Life stuff, errands, reminders…"
                  value={personalTodos}
                  onChange={(e) => setPersonalTodos(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </section>

              <p className="text-xs text-secondary">
                Then: read non-fiction (paper), shower, time with Sarah, plug
                in phone, bed.
              </p>
            </div>

            <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3 text-sm text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
              >
                Save & wind down
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
