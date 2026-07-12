import { Entry, MetricKey } from "./types";

const BUSyness_LABELS: Record<string, string> = {
  packed: "Packed",
  normal: "Normal",
  relaxed: "Relaxed",
};

const FOOD_LABELS: Record<string, string> = {
  clean: "Clean",
  normal: "Normal",
  unhealthy: "Unhealthy",
};

export function formatAlcohol(value: number | null): string | null {
  if (value === null) return null;
  return value === 0 ? "No alcohol" : "Had alcohol";
}

export function formatWater(value: number | null): string | null {
  if (value === null) return null;
  return value === 1 ? "Hydrated" : "Dehydrated";
}

export function formatWorkout(value: number | null): string | null {
  if (value === null) return null;
  return value === 1 ? "Worked out" : "No workout";
}

export function formatReading(value: number | null): string | null {
  if (value === null) return null;
  return value === 1 ? "Read" : "Didn't read";
}

export function formatMetricValue(
  key: MetricKey,
  entry: Entry | null
): string | null {
  if (!entry) return null;

  switch (key) {
    case "skin_score":
    case "stress":
    case "workload":
      return entry[key] !== null ? String(entry[key]) : null;
    case "busyness":
      return entry.busyness ? BUSyness_LABELS[entry.busyness] : null;
    case "sleep":
      return entry.sleep;
    case "food":
      return entry.food ? FOOD_LABELS[entry.food] : null;
    case "alcohol":
      return formatAlcohol(entry.alcohol);
    case "water":
      return formatWater(entry.water);
    case "workout":
      return formatWorkout(entry.workout);
    case "reading":
      return formatReading(entry.reading);
    case "weight_kg":
      return entry.weight_kg !== null ? `${entry.weight_kg} kg` : null;
    case "notes":
      if (!entry.notes) return null;
      return entry.notes.length > 40
        ? `${entry.notes.slice(0, 40)}…`
        : entry.notes;
    default:
      return null;
  }
}

/** Cycle boolean metric: unset → good → bad → unset */
export function cycleBooleanMetric(
  current: number | null,
  goodValue: 0 | 1
): number | null {
  if (current === null) return goodValue;
  const badValue = goodValue === 0 ? 1 : 0;
  if (current === goodValue) return badValue;
  return null;
}
