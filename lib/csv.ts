import { getDb } from "./db";
import { formatLocalDate } from "./dates";

const CSV_COLUMNS: { key: string; header: string }[] = [
  {
    key: "date",
    header:
      "date - calendar date of the entry in YYYY-MM-DD format",
  },
  {
    key: "skin_score",
    header:
      "skin_score - a score from 1-10 rating skin quality. 1 is poor/irritated skin (Ouch), 10 is perfect skin",
  },
  {
    key: "stress",
    header:
      "stress - a score from 1-10 rating stress level. 1 is bliss/calm, 10 is overwhelmed",
  },
  {
    key: "workload",
    header:
      "workload - a score from 1-10 scoring how many work tasks are currently on hand. 1 is low workload with not much on, 10 is burnt out with lots to manage",
  },
  {
    key: "busyness",
    header:
      "busyness - how packed the day felt. Values: packed, normal, or relaxed",
  },
  {
    key: "sleep",
    header:
      "sleep - hours of sleep last night. Values: <8hr (under 8 hours), 8hr (about 8 hours), or 8hr+ (more than 8 hours)",
  },
  {
    key: "food",
    header:
      "food - quality of food eaten today. Values: clean (healthy), normal (average), or unhealthy (junk/processed)",
  },
  {
    key: "alcohol",
    header:
      "alcohol - whether alcohol was consumed. 0 = no alcohol, 1 = had alcohol",
  },
  {
    key: "water",
    header:
      "water - hydration level. 0 = dehydrated (did not drink enough water), 1 = hydrated (good water intake)",
  },
  {
    key: "workout",
    header:
      "workout - whether exercise was done. 0 = no workout, 1 = worked out",
  },
  {
    key: "reading",
    header:
      "reading - whether reading was done. 0 = did not read, 1 = read today",
  },
  {
    key: "weight_kg",
    header: "weight_kg - body weight in kilograms",
  },
  {
    key: "notes",
    header:
      "notes - free-text notes about the day, mood, events, or anything relevant",
  },
];

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(): string {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT date, skin_score, stress, workload, busyness, sleep, food, alcohol, water, workout, reading, weight_kg, notes
       FROM entries ORDER BY date ASC`
    )
    .all() as Record<string, unknown>[];

  const headerLine = CSV_COLUMNS.map((col) =>
    escapeCsvValue(col.header)
  ).join(",");
  const lines = [headerLine];

  for (const row of rows) {
    const line = CSV_COLUMNS.map((col) =>
      escapeCsvValue(row[col.key])
    ).join(",");
    lines.push(line);
  }
  return lines.join("\n");
}

export function getExportFilename(): string {
  return `streaks-export-${formatLocalDate(new Date())}.csv`;
}
