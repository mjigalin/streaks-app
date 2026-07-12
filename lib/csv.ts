import { getDb } from "./db";

const CSV_HEADERS = [
  "date",
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

  const lines = [CSV_HEADERS.join(",")];
  for (const row of rows) {
    const line = CSV_HEADERS.map((header) =>
      escapeCsvValue(row[header])
    ).join(",");
    lines.push(line);
  }
  return lines.join("\n");
}
