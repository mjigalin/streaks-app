"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import {
  getApplicableHabits,
  HabitSection,
} from "@/lib/habits";
import { HabitCompletion } from "@/lib/completions";
import { WeeklyGoal } from "@/lib/challenge";
import { getWeekStart } from "@/lib/challenge";
import { addDays, formatDateLabel, getTodayStr } from "@/lib/dates";
import HabitItem from "./HabitItem";
import RulesDrawer from "./RulesDrawer";
import WeeklyPrompt from "./WeeklyPrompt";

interface DayResponse {
  date: string;
  habits: Record<string, HabitCompletion>;
  completedCount: number;
  totalCount: number;
  streak: number;
  weightAverage: number | null;
}

const SECTIONS: HabitSection[] = [
  "Morning",
  "Work block",
  "Afternoon",
  "Evening",
];

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(getTodayStr());
  const [dayData, setDayData] = useState<DayResponse | null>(null);
  const [activePrompt, setActivePrompt] = useState<WeeklyGoal | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDay = useCallback(async (date: string) => {
    const [dayRes, weekRes] = await Promise.all([
      fetch(`/api/day?date=${date}`),
      fetch(`/api/weekly?date=${date}`),
    ]);
    const day = await dayRes.json();
    const week = await weekRes.json();
    setDayData(day);
    setActivePrompt((current) => current ?? week.prompts?.[0] ?? null);
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
    const data = await res.json();
    setDayData(data);
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
    const data = await res.json();
    setDayData(data);
  };

  const handleWeeklyComplete = async (goalId: string) => {
    const weekStart = getWeekStart(currentDate);
    await fetch("/api/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_start: weekStart, goal_id: goalId, completed: true }),
    });
    setActivePrompt(null);
  };

  const handleWeeklyLater = () => {
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading || !dayData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  const applicable = getApplicableHabits(currentDate);
  const completed = applicable.filter((h) => dayData.habits[h.id]?.completed);
  const incomplete = applicable.filter((h) => !dayData.habits[h.id]?.completed);
  const isToday = currentDate === getTodayStr();

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[480px] px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-secondary hover:bg-surface hover:text-primary"
              aria-label="Rules"
            >
              ☰
            </button>
            <div className="text-center">
              <p className="text-xs text-secondary">
                {formatDateLabel(currentDate)}
              </p>
              {dayData.streak > 0 && (
                <p className="text-xs font-medium text-accent">
                  🔥 {dayData.streak}-day streak
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
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
                {isToday ? " today" : ""}
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

          {/* Progress bar */}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full bg-success"
              initial={false}
              animate={{
                width: `${dayData.totalCount ? (dayData.completedCount / dayData.totalCount) * 100 : 0}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pt-4">
        {/* Completed — faded, scroll up to see */}
        {completed.length > 0 && (
          <section className="mb-6 border-b border-border/50 pb-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-secondary/60">
              Done — scroll up anytime
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
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
          </section>
        )}

        {/* Active habits by section */}
        {SECTIONS.map((section) => {
          const sectionHabits = incomplete.filter((h) => h.section === section);
          if (sectionHabits.length === 0) return null;

          return (
            <section key={section} className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
                {section}
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
                        habit.acceptsWeight ? dayData.weightAverage : undefined
                      }
                      onToggle={toggleHabit}
                      onWeightChange={setWeight}
                    />
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            </section>
          );
        })}

        {incomplete.length === 0 && completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-success/30 bg-success/10 px-4 py-6 text-center"
          >
            <p className="text-2xl">🎉</p>
            <p className="mt-2 font-semibold text-primary">All done for today!</p>
            <p className="mt-1 text-sm text-secondary">
              Full day complete. Rest up.
            </p>
          </motion.div>
        )}
      </main>

      <RulesDrawer open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <WeeklyPrompt
        prompt={activePrompt}
        onComplete={handleWeeklyComplete}
        onDismiss={handleWeeklyDismiss}
        onLater={handleWeeklyLater}
      />
    </div>
  );
}
