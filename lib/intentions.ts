export interface DailyIntentions {
  for_date: string;
  source_date: string;
  tomorrow_chore: string | null;
  tomorrow_workout: string | null;
  work_brain_dump: string | null;
  personal_todos: string | null;
}

export interface SaveIntentionsInput {
  source_date: string;
  tomorrow_chore?: string;
  tomorrow_workout?: string;
  work_brain_dump?: string;
  personal_todos?: string;
}
