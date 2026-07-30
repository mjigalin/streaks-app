import { parseLocalDate, formatLocalDate } from "./dates";

export interface WeeklyGoal {
  id: string;
  label: string;
  prompt: string;
  /** Day of week to show prompt: 0 Sun … 6 Sat */
  promptDay: number;
}

export const WEEKLY_GOALS: WeeklyGoal[] = [
  {
    id: "date_night",
    label: "Date night with Sarah",
    prompt: "Have you planned this week's date night with Sarah?",
    promptDay: 5, // Friday
  },
  {
    id: "sunday_review",
    label: "45-minute Sunday review",
    prompt:
      "Time for your weekly review — wins, misses, and next week's one priority. Done?",
    promptDay: 0, // Sunday
  },
];

/** Monday of the week containing `date` */
export function getWeekStart(date: string): string {
  const d = parseLocalDate(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}

export function getPromptsForDate(date: string): WeeklyGoal[] {
  const dow = parseLocalDate(date).getDay();
  return WEEKLY_GOALS.filter((g) => g.promptDay === dow);
}
