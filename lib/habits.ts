import { parseLocalDate } from "./dates";

export type HabitSection =
  | "Morning"
  | "Work block"
  | "Afternoon"
  | "Evening";

export type HabitInputType = "none" | "weight" | "text" | "evening_ritual";

export interface HabitDefinition {
  id: string;
  number: number;
  section: HabitSection;
  emoji: string;
  title: string;
  subtitle?: string;
  /** Shown under title for dynamic habits */
  getSubtitle?: (date: string) => string;
  getTitle?: (date: string) => string;
  isApplicable?: (date: string) => boolean;
  inputType?: HabitInputType;
  /** Sub-items listed under evening ritual */
  ritualSteps?: string[];
}

function dayOfWeek(date: string): number {
  return parseLocalDate(date).getDay();
}

export const DAILY_HABITS: HabitDefinition[] = [
  {
    id: "wake",
    number: 1,
    section: "Morning",
    emoji: "⏰",
    title: "7am Wake-up",
    subtitle: "Same time, every day",
  },
  {
    id: "weigh_in",
    number: 2,
    section: "Morning",
    emoji: "⚖️",
    title: "Weigh in",
    subtitle: "Log it — check 7-day average only",
    inputType: "weight",
  },
  {
    id: "water_morning",
    number: 3,
    section: "Morning",
    emoji: "💧",
    title: "Big Glass of Water",
  },
  {
    id: "outdoors",
    number: 4,
    section: "Morning",
    emoji: "🚶",
    title: "15 Minute Walk",
    subtitle: "Outdoors — walk starts here",
  },
  {
    id: "cyclic_sighing",
    number: 5,
    section: "Morning",
    emoji: "🌬️",
    title: "Cyclic Sighing",
    subtitle: "5 minutes",
  },
  {
    id: "protein_breakfast",
    number: 6,
    section: "Morning",
    emoji: "🍳",
    title: "Protein Breakfast",
    subtitle: "30g protein",
  },
  {
    id: "espresso",
    number: 7,
    section: "Morning",
    emoji: "☕",
    title: "Espresso",
  },
  {
    id: "focus_block",
    number: 8,
    section: "Work block",
    emoji: "🎯",
    title: "90 Min Focused Work",
    subtitle:
      "One defined outcome written down first. Phone away — no email or Slack until done",
  },
  {
    id: "outreach",
    number: 9,
    section: "Work block",
    emoji: "📣",
    title: "30 Min Outreach / Sales",
    subtitle: "LinkedIn & outreach block",
    isApplicable: (date) => {
      const d = dayOfWeek(date);
      return d >= 1 && d <= 5;
    },
  },
  {
    id: "chore",
    number: 10,
    section: "Afternoon",
    emoji: "🔨",
    title: "Meaningful Chore",
    subtitle: "House progress or a real job",
    inputType: "text",
  },
  {
    id: "water_2l",
    number: 11,
    section: "Afternoon",
    emoji: "💧",
    title: "2L Water",
    subtitle: "Hit 2 litres by dinner",
  },
  {
    id: "workout",
    number: 12,
    section: "Evening",
    emoji: "🏋️",
    title: "Workout",
    getTitle: (date) => {
      const d = dayOfWeek(date);
      if (d === 1 || d === 2 || d === 4 || d === 5) return "Weights Workout";
      if (d === 3) return "Run Day";
      if (d === 6) return "Easy Workout";
      return "Rest Day";
    },
    getSubtitle: (date) => {
      const d = dayOfWeek(date);
      if (d === 6) return "Easy session or take the day off";
      if (d === 0) return "Rest — no workout required";
      return "Harder session tonight";
    },
  },
  {
    id: "evening_ritual",
    number: 13,
    section: "Evening",
    emoji: "🌙",
    title: "Evening Ritual",
    subtitle: "Phone off after this — plug in & wind down",
    inputType: "evening_ritual",
    ritualSteps: [
      "Write tomorrow's intentions",
      "Read non-fiction (paper only)",
      "Shower",
      "Time with Sarah",
      "Phone plugged in for the night",
    ],
  },
];

export function getHabitTitle(habit: HabitDefinition, date: string): string {
  return habit.getTitle ? habit.getTitle(date) : habit.title;
}

export function getHabitSubtitle(
  habit: HabitDefinition,
  date: string
): string | undefined {
  return habit.getSubtitle ? habit.getSubtitle(date) : habit.subtitle;
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

/** @deprecated use getHabitTitle */
export function getHabitLabel(habit: HabitDefinition, date: string): string {
  return getHabitTitle(habit, date);
}
