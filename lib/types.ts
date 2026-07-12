export type Busyness = "packed" | "normal" | "relaxed";
export type Sleep = "<8hr" | "8hr" | "8hr+";
export type Food = "clean" | "normal" | "unhealthy";

export interface Entry {
  date: string;
  skin_score: number | null;
  stress: number | null;
  workload: number | null;
  busyness: Busyness | null;
  sleep: Sleep | null;
  food: Food | null;
  alcohol: number | null;
  water: number | null;
  workout: number | null;
  reading: number | null;
  weight_kg: number | null;
  notes: string | null;
}

export type MetricKey =
  | "skin_score"
  | "stress"
  | "workload"
  | "busyness"
  | "sleep"
  | "food"
  | "alcohol"
  | "water"
  | "workout"
  | "reading"
  | "weight_kg"
  | "notes";

export const METRIC_KEYS: MetricKey[] = [
  "skin_score",
  "stress",
  "workload",
  "busyness",
  "sleep",
  "food",
  "alcohol",
  "water",
  "workout",
  "reading",
  "weight_kg",
  "notes",
];

export const BOOLEAN_METRICS: MetricKey[] = [
  "alcohol",
  "water",
  "workout",
  "reading",
];

export function isMetricTracked(entry: Entry | null, key: MetricKey): boolean {
  if (!entry) return false;
  const value = entry[key];
  if (BOOLEAN_METRICS.includes(key)) {
    return value === 0 || value === 1;
  }
  return value !== null && value !== undefined;
}

export function countTrackedMetrics(entry: Partial<Entry> | null): number {
  if (!entry) return 0;
  return METRIC_KEYS.filter((key) => {
    const value = entry[key];
    if (BOOLEAN_METRICS.includes(key)) {
      return value === 0 || value === 1;
    }
    return value !== null && value !== undefined && value !== "";
  }).length;
}

export function emptyEntry(date: string): Entry {
  return {
    date,
    skin_score: null,
    stress: null,
    workload: null,
    busyness: null,
    sleep: null,
    food: null,
    alcohol: null,
    water: null,
    workout: null,
    reading: null,
    weight_kg: null,
    notes: null,
  };
}
