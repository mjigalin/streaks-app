import { parseLocalDate } from "./dates";

export type HabitSection =
  | "Morning"
  | "Work block"
  | "Afternoon"
  | "Evening";

export interface HabitDefinition {
  id: string;
  number: number;
  section: HabitSection;
  label: string;
  /** Returns false on days this habit doesn't apply (excluded from streak denominator) */
  isApplicable?: (date: string) => boolean;
  /** Dynamic label based on day of week */
  getLabel?: (date: string) => string;
  acceptsWeight?: boolean;
}

function dayOfWeek(date: string): number {
  return parseLocalDate(date).getDay(); // 0 Sun … 6 Sat
}

export const DAILY_HABITS: HabitDefinition[] = [
  {
    id: "wake",
    number: 1,
    section: "Morning",
    label: "7:00 wake — same time every day",
  },
  {
    id: "weigh_in",
    number: 2,
    section: "Morning",
    label: "Weigh in & log it (check 7-day average only)",
    acceptsWeight: true,
  },
  {
    id: "water_morning",
    number: 3,
    section: "Morning",
    label: "Big glass of water",
  },
  {
    id: "outdoors",
    number: 4,
    section: "Morning",
    label: "15 minutes outdoors — walk starts here",
  },
  {
    id: "cyclic_sighing",
    number: 5,
    section: "Morning",
    label: "5 minutes cyclic sighing",
  },
  {
    id: "protein_breakfast",
    number: 6,
    section: "Morning",
    label: "30g protein breakfast",
  },
  {
    id: "espresso",
    number: 7,
    section: "Morning",
    label: "Espresso",
  },
  {
    id: "focus_block",
    number: 8,
    section: "Work block",
    label:
      "90-min focus session — one defined outcome written down first. Phone away, no email or Slack until done",
  },
  {
    id: "outreach",
    number: 9,
    section: "Work block",
    label: "30 minutes outreach",
    isApplicable: (date) => {
      const d = dayOfWeek(date);
      return d >= 1 && d <= 5; // Mon–Fri
    },
    getLabel: (date) => {
      const d = dayOfWeek(date);
      if (d === 5) return "30 min outreach — ContentMate channels (Fri)";
      if (d >= 1 && d <= 4)
        return "30 min outreach — CactusCan corporate LinkedIn (Mon–Thu)";
      return "30 minutes outreach";
    },
  },
  {
    id: "chore",
    number: 10,
    section: "Afternoon",
    label: "One meaningful chore — house progress or a real job",
  },
  {
    id: "water_2l",
    number: 11,
    section: "Afternoon",
    label: "Hit 2L water by dinner",
  },
  {
    id: "workout",
    number: 12,
    section: "Evening",
    label: "Workout",
    getLabel: (date) => {
      const d = dayOfWeek(date);
      if (d === 1 || d === 2 || d === 4 || d === 5)
        return "Harder workout — weights";
      if (d === 3) return "Harder workout — run";
      if (d === 6) return "Easy workout or rest day";
      return "Rest day — no workout required";
    },
  },
  {
    id: "shutdown",
    number: 13,
    section: "Evening",
    label:
      "Shutdown ritual — write tomorrow's list, phone plugged in for the night",
  },
  {
    id: "shower",
    number: 14,
    section: "Evening",
    label: "Shower",
  },
  {
    id: "reading",
    number: 15,
    section: "Evening",
    label: "Read non-fiction — paper only",
  },
  {
    id: "bed",
    number: 16,
    section: "Evening",
    label: "Bed",
  },
];

export function getHabitLabel(habit: HabitDefinition, date: string): string {
  return habit.getLabel ? habit.getLabel(date) : habit.label;
}

export function isHabitApplicable(habit: HabitDefinition, date: string): boolean {
  return habit.isApplicable ? habit.isApplicable(date) : true;
}

export function getApplicableHabits(date: string): HabitDefinition[] {
  return DAILY_HABITS.filter((h) => isHabitApplicable(h, date));
}

export function getHabitById(id: string): HabitDefinition | undefined {
  return DAILY_HABITS.find((h) => h.id === id);
}
