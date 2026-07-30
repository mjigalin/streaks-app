"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { getApplicableHabits, HabitSection } from "@/lib/habits";
import { HabitCompletion } from "@/lib/completions";
import { DailyIntentions } from "@/lib/intentions";
import { WeeklyGoal } from "@/lib/challenge";
import { getWeekStart } from "@/lib/challenge";
import { addDays, formatDateLabel, getTodayStr } from "@/lib/dates";
import HabitItem from "./HabitItem";
import RulesDrawer from "./RulesDrawer";
import WeeklyPrompt from "./WeeklyPrompt";
import EveningIntentionsModal from "./EveningIntentionsModal";
import MorningIntentionsCard from "./MorningIntentionsCard";

interface DayResponse {
  date: string;
  habits: Record<string, HabitCompletion>;
  completedCount: number;
  totalCount: number;
  streak: number;
  weightAverage: number | null;
  intentions: DailyIntentions | null;
}

const SECTIONS: HabitSection[] = [
  "Morning",
  "Work block",
  "Afternoon",
  "Evening",
];

function intentionsDismissKey(date: string) {
  return `intentions-dismissed-${date}`;
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(getTodayStr());
  const [dayData, setDayData] = useState<DayResponse | null>(null);
  const [activePrompt, setActivePrompt] = useState<WeeklyGoal | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [eveningModalOpen, setEveningModalOpen] = useState(false);
  const [intentionsDismissed, setIntentionsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const textDebounce = useRef<NodeJS.Timeout>();

  const fetchDay = useCallback(async (date: string) => {
    const [dayRes, weekRes] = await Promise.all([
      fetch(`/api/day?date=${date}`),
      fetch(`/api/weekly?date=${date}`),
    ]);
    const day = await dayRes.json();
    const week = await weekRes.json();
    setDayData(day);
    setActivePrompt((current) => current ?? week.prompts?.[0] ?? null);
    setIntentionsDismissed(
      !!localStorage.getItem(intentionsDismissKey(date))
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDay(currentDate).finally(() => setLoading(false));
  }, [currentDate, fetchDay]);

  const toggleHabit = async (habitId: string) => {
    const res = await fetch("/api/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: currentDate, habit_id: habitId }),
    });
    setDayData(await res.json());
  };

  const setWeight = async (habitId: string, weight: number | null) => {
    const res = await fetch("/api/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        habit_id: habitId,
        action: "set_weight",
        value: weight,
      }),
    });
    setDayData(await res.json());
  };

  const setText = (habitId: string, text: string | null) => {
    if (textDebounce.current) clearTimeout(textDebounce.current);
    textDebounce.current = setTimeout(async () => {
      const res = await fetch("/api/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: currentDate,
          habit_id: habitId,
          action: "set_text",
          text,
        }),
      });
      setDayData(await res.json());
    }, 500);
  };

  const saveEveningIntentions = async (data: {
    tomorrow_chore: string;
    tomorrow_workout: string;
    work_brain_dump: string;
    personal_todos: string;
  }) => {
    const res = await fetch("/api/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        action: "save_intentions",
        intentions: data,
      }),
    });
    setDayData(await res.json());
    setEveningModalOpen(false);
  };

  const dismissMorningIntentions = () => {
    localStorage.setItem(intentionsDismissKey(currentDate), "1");
    setIntentionsDismissed(true);
  };

  const handleWeeklyComplete = async (goalId: string) => {
    const weekStart = getWeekStart(currentDate);
    await fetch("/api/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        week_start: weekStart,
        goal_id: goalId,
        completed: true,
      }),
    });
    setActivePrompt(null);
  };

  const handleWeeklyDismiss = async (promptId: string) => {
    const weekStart = getWeekStart(currentDate);
    await fetch("/api/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        week_start: weekStart,
        action: "dismiss",
        prompt_id: promptId,
      }),
    });
    setActivePrompt(null);
  };

  if (loading || !dayData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-secondary"
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  const applicable = getApplicableHabits(currentDate);
  const completed = applicable.filter((h) => dayData.habits[h.id]?.completed);
  const incomplete = applicable.filter((h) => !dayData.habits[h.id]?.completed);
  const isToday = currentDate === getTodayStr();
  const showMorningCard =
    isToday && dayData.intentions && !intentionsDismissed;

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-secondary transition-colors hover:bg-surface hover:text-primary"
              aria-label="Rules"
            >
              ☰
            </button>
            <div className="text-center">
              <p className="text-xs text-secondary">
                {formatDateLabel(currentDate)}
              </p>
              {dayData.streak > 0 && (
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-medium text-accent"
                >
                  🔥 {dayData.streak}-day streak
                </motion.p>
              )}
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="text-xs text-secondary hover:text-primary"
            >
              Out
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentDate(addDays(currentDate, -1))}
              className="rounded-full px-3 py-1 text-sm text-secondary hover:bg-surface"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-primary">Hey Matt!</h1>
              <p className="text-xs text-secondary">
                {dayData.completedCount} of {dayData.totalCount} done
              </p>
            </div>
            {!isToday ? (
              <button
                type="button"
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                className="rounded-full px-3 py-1 text-sm text-secondary hover:bg-surface"
              >
                →
              </button>
            ) : (
              <div className="w-8" />
            )}
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-success"
              initial={false}
              animate={{
                width: `${dayData.totalCount ? (dayData.completedCount / dayData.totalCount) * 100 : 0}%`,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pt-5">
        <AnimatePresence>
          {showMorningCard && dayData.intentions && (
            <MorningIntentionsCard
              intentions={dayData.intentions}
              onDismiss={dismissMorningIntentions}
            />
          )}
        </AnimatePresence>

        {completed.length > 0 && (
          <section className="mb-5 border-b border-border/40 pb-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-secondary/50">
              ✓ Done
            </p>
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {completed.map((habit, i) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    date={currentDate}
                    completion={dayData.habits[habit.id]}
                    isLast={i === completed.length - 1}
                    faded
                    onToggle={toggleHabit}
                    onEveningRitual={() => setEveningModalOpen(true)}
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
          </section>
        )}

        {SECTIONS.map((section, si) => {
          const sectionHabits = incomplete.filter((h) => h.section === section);
          if (sectionHabits.length === 0) return null;

          return (
            <motion.section
              key={section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06 }}
              className="mb-8"
            >
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <span className="h-px flex-1 bg-border" />
                {section}
                <span className="h-px flex-1 bg-border" />
              </p>
              <LayoutGroup>
                <AnimatePresence mode="popLayout">
                  {sectionHabits.map((habit, i) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      date={currentDate}
                      completion={dayData.habits[habit.id]}
                      isLast={i === sectionHabits.length - 1}
                      weightAverage={
                        habit.inputType === "weight"
                          ? dayData.weightAverage
                          : undefined
                      }
                      onToggle={toggleHabit}
                      onWeightChange={setWeight}
                      onTextChange={setText}
                      onEveningRitual={() => setEveningModalOpen(true)}
                    />
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            </motion.section>
          );
        })}

        {incomplete.length === 0 && completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-success/30 bg-success/10 px-4 py-8 text-center"
          >
            <motion.p
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl"
            >
              🎉
            </motion.p>
            <p className="mt-3 text-lg font-bold text-primary">
              All done for today!
            </p>
            <p className="mt-1 text-sm text-secondary">Rest up, Matt.</p>
          </motion.div>
        )}
      </main>

      <RulesDrawer open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <WeeklyPrompt
        prompt={activePrompt}
        onComplete={handleWeeklyComplete}
        onDismiss={handleWeeklyDismiss}
        onLater={() => setActivePrompt(null)}
      />

      <EveningIntentionsModal
        key={currentDate}
        open={eveningModalOpen}
        date={currentDate}
        onClose={() => setEveningModalOpen(false)}
        onSave={saveEveningIntentions}
      />
    </div>
  );
}
