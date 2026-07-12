import { getDb } from "./db";
import {
  Entry,
  METRIC_KEYS,
  MetricKey,
  isMetricTracked,
} from "./types";

export interface StreakResult {
  overall: number;
  metrics: Record<MetricKey, number>;
}

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    date: row.date as string,
    skin_score: (row.skin_score as number | null) ?? null,
    stress: (row.stress as number | null) ?? null,
    workload: (row.workload as number | null) ?? null,
    busyness: (row.busyness as Entry["busyness"]) ?? null,
    sleep: (row.sleep as Entry["sleep"]) ?? null,
    food: (row.food as Entry["food"]) ?? null,
    alcohol: row.alcohol === null || row.alcohol === undefined ? null : (row.alcohol as number),
    water: row.water === null || row.water === undefined ? null : (row.water as number),
    workout: row.workout === null || row.workout === undefined ? null : (row.workout as number),
    reading: row.reading === null || row.reading === undefined ? null : (row.reading as number),
    weight_kg: (row.weight_kg as number | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

function getOrderedEntries(): Entry[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT date, skin_score, stress, workload, busyness, sleep, food, alcohol, water, workout, reading, weight_kg, notes FROM entries ORDER BY date DESC LIMIT 365"
    )
    .all() as Record<string, unknown>[];
  return rows.map(rowToEntry);
}

function buildDateSet(entries: Entry[]): Map<string, Entry> {
  const map = new Map<string, Entry>();
  for (const entry of entries) {
    map.set(entry.date, entry);
  }
  return map;
}

function getStartDate(entries: Entry[], today: string): string | null {
  if (entries.length === 0) return null;
  const entryMap = buildDateSet(entries);
  if (entryMap.has(today)) return today;

  const todayDate = new Date(today + "T12:00:00");
  todayDate.setDate(todayDate.getDate() - 1);
  return todayDate.toISOString().slice(0, 10);
}

function previousDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function calculateMetricStreak(
  entryMap: Map<string, Entry>,
  startDate: string | null,
  key: MetricKey
): number {
  if (!startDate) return 0;

  let streak = 0;
  let current = startDate;

  while (true) {
    const entry = entryMap.get(current);
    if (!entry || !isMetricTracked(entry, key)) break;
    streak++;
    current = previousDate(current);
  }

  return streak;
}

function calculateOverallStreak(
  entryMap: Map<string, Entry>,
  startDate: string | null
): number {
  if (!startDate) return 0;

  let streak = 0;
  let current = startDate;

  while (true) {
    const entry = entryMap.get(current);
    if (!entry) break;
    const allTracked = METRIC_KEYS.every((key) => isMetricTracked(entry, key));
    if (!allTracked) break;
    streak++;
    current = previousDate(current);
  }

  return streak;
}

export function calculateStreaks(today?: string): StreakResult {
  const todayStr =
    today ?? new Date().toISOString().slice(0, 10);
  const entries = getOrderedEntries();
  const entryMap = buildDateSet(entries);
  const startDate = getStartDate(entries, todayStr);

  const metrics = {} as Record<MetricKey, number>;
  for (const key of METRIC_KEYS) {
    metrics[key] = calculateMetricStreak(entryMap, startDate, key);
  }

  return {
    overall: calculateOverallStreak(entryMap, startDate),
    metrics,
  };
}
