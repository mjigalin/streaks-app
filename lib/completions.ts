import { getDb } from "./db";
import {
  getApplicableHabits,
  getHabitById,
} from "./habits";
import { getWeekStart } from "./challenge";
import { addDays } from "./dates";

export interface HabitCompletion {
  habit_id: string;
  completed: boolean;
  completed_at: string | null;
  value: number | null;
}

export interface DayData {
  date: string;
  habits: Record<string, HabitCompletion>;
  completedCount: number;
  totalCount: number;
}

export interface WeeklyStatus {
  week_start: string;
  goals: Record<
    string,
    { completed: boolean; completed_at: string | null }
  >;
}

function rowToCompletion(row: {
  habit_id: string;
  completed: number;
  completed_at: string | null;
  value: number | null;
}): HabitCompletion {
  return {
    habit_id: row.habit_id,
    completed: row.completed === 1,
    completed_at: row.completed_at,
    value: row.value,
  };
}

export function getDayCompletions(date: string): DayData {
  const db = getDb();
  const applicable = getApplicableHabits(date);
  const rows = db
    .prepare(
      `SELECT habit_id, completed, completed_at, value
       FROM habit_completions WHERE date = ?`
    )
    .all(date) as {
    habit_id: string;
    completed: number;
    completed_at: string | null;
    value: number | null;
  }[];

  const map: Record<string, HabitCompletion> = {};
  for (const row of rows) {
    map[row.habit_id] = rowToCompletion(row);
  }

  for (const habit of applicable) {
    if (!map[habit.id]) {
      map[habit.id] = {
        habit_id: habit.id,
        completed: false,
        completed_at: null,
        value: null,
      };
    }
  }

  const completedCount = applicable.filter(
    (h) => map[h.id]?.completed
  ).length;

  return {
    date,
    habits: map,
    completedCount,
    totalCount: applicable.length,
  };
}

export function toggleHabit(
  date: string,
  habitId: string,
  value?: number | null
): DayData {
  const habit = getHabitById(habitId);
  if (!habit) throw new Error("Unknown habit");

  const db = getDb();
  const existing = db
    .prepare(
      `SELECT completed, value FROM habit_completions WHERE date = ? AND habit_id = ?`
    )
    .get(date, habitId) as
    | { completed: number; value: number | null }
    | undefined;

  const nowCompleted = existing?.completed === 1;

  if (nowCompleted) {
    db.prepare(
      `UPDATE habit_completions SET completed = 0, completed_at = NULL, value = ?
       WHERE date = ? AND habit_id = ?`
    ).run(value ?? existing?.value ?? null, date, habitId);
  } else {
    db.prepare(
      `INSERT INTO habit_completions (date, habit_id, completed, completed_at, value)
       VALUES (?, ?, 1, datetime('now'), ?)
       ON CONFLICT(date, habit_id) DO UPDATE SET
         completed = 1,
         completed_at = datetime('now'),
         value = COALESCE(excluded.value, habit_completions.value)`
    ).run(date, habitId, value ?? null);
  }

  return getDayCompletions(date);
}

export function setHabitWeight(
  date: string,
  habitId: string,
  weight: number | null
): DayData {
  const db = getDb();
  const existing = db
    .prepare(
      `SELECT completed FROM habit_completions WHERE date = ? AND habit_id = ?`
    )
    .get(date, habitId);

  if (existing) {
    db.prepare(
      `UPDATE habit_completions SET value = ? WHERE date = ? AND habit_id = ?`
    ).run(weight, date, habitId);
  } else {
    db.prepare(
      `INSERT INTO habit_completions (date, habit_id, completed, value)
       VALUES (?, ?, 0, ?)`
    ).run(date, habitId, weight);
  }

  return getDayCompletions(date);
}

export function getWeeklyStatus(date: string): WeeklyStatus {
  return getWeeklyStatusForWeek(getWeekStart(date));
}

export function getWeeklyStatusForWeek(weekStart: string): WeeklyStatus {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT goal_id, completed, completed_at FROM weekly_completions WHERE week_start = ?`
    )
    .all(weekStart) as {
    goal_id: string;
    completed: number;
    completed_at: string | null;
  }[];

  const goals: WeeklyStatus["goals"] = {};
  for (const row of rows) {
    goals[row.goal_id] = {
      completed: row.completed === 1,
      completed_at: row.completed_at,
    };
  }

  return { week_start: weekStart, goals };
}

export function completeWeeklyGoal(
  weekStart: string,
  goalId: string,
  completed: boolean
): WeeklyStatus {
  const db = getDb();
  db.prepare(
    `INSERT INTO weekly_completions (week_start, goal_id, completed, completed_at)
     VALUES (?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)
     ON CONFLICT(week_start, goal_id) DO UPDATE SET
       completed = excluded.completed,
       completed_at = CASE WHEN excluded.completed = 1 THEN datetime('now') ELSE NULL END`
  ).run(weekStart, goalId, completed ? 1 : 0, completed ? 1 : 0);

  return getWeeklyStatusForWeek(weekStart);
}

export function dismissPrompt(
  weekStart: string,
  promptId: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO dismissed_prompts (week_start, prompt_id, dismissed_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(week_start, prompt_id) DO UPDATE SET dismissed_at = datetime('now')`
  ).run(weekStart, promptId);
}

export function isPromptDismissed(
  weekStart: string,
  promptId: string
): boolean {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT 1 FROM dismissed_prompts WHERE week_start = ? AND prompt_id = ?`
    )
    .get(weekStart, promptId);
  return !!row;
}

/** 7-day rolling average weight from weigh-in habit */
export function getWeightAverage(endDate: string): number | null {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT value FROM habit_completions
       WHERE habit_id = 'weigh_in' AND value IS NOT NULL AND date <= ?
       ORDER BY date DESC LIMIT 7`
    )
    .all(endDate) as { value: number }[];

  if (rows.length === 0) return null;
  const sum = rows.reduce((a, r) => a + r.value, 0);
  return Math.round((sum / rows.length) * 10) / 10;
}

export function calculateStreak(endDate: string): number {
  const db = getDb();
  let streak = 0;
  let current = endDate;

  while (true) {
    const applicable = getApplicableHabits(current);
    if (applicable.length === 0) break;

    const rows = db
      .prepare(
        `SELECT habit_id, completed FROM habit_completions WHERE date = ? AND completed = 1`
      )
      .all(current) as { habit_id: string }[];

    const completedIds = new Set(rows.map((r) => r.habit_id));
    const allDone = applicable.every((h) => completedIds.has(h.id));

    if (!allDone) break;
    streak++;
    current = addDays(current, -1);
  }

  return streak;
}
