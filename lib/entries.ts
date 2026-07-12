import { getDb } from "./db";
import { Entry } from "./types";

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

export function getEntryByDate(date: string): Entry | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT date, skin_score, stress, workload, busyness, sleep, food, alcohol, water, workout, reading, weight_kg, notes
       FROM entries WHERE date = ?`
    )
    .get(date) as Record<string, unknown> | undefined;
  return row ? rowToEntry(row) : null;
}

export function upsertEntry(data: Partial<Entry> & { date: string }): void {
  const db = getDb();
  const existing = getEntryByDate(data.date);

  const entry: Entry = {
    date: data.date,
    skin_score: data.skin_score !== undefined ? data.skin_score : existing?.skin_score ?? null,
    stress: data.stress !== undefined ? data.stress : existing?.stress ?? null,
    workload: data.workload !== undefined ? data.workload : existing?.workload ?? null,
    busyness: data.busyness !== undefined ? data.busyness : existing?.busyness ?? null,
    sleep: data.sleep !== undefined ? data.sleep : existing?.sleep ?? null,
    food: data.food !== undefined ? data.food : existing?.food ?? null,
    alcohol: data.alcohol !== undefined ? data.alcohol : existing?.alcohol ?? null,
    water: data.water !== undefined ? data.water : existing?.water ?? null,
    workout: data.workout !== undefined ? data.workout : existing?.workout ?? null,
    reading: data.reading !== undefined ? data.reading : existing?.reading ?? null,
    weight_kg: data.weight_kg !== undefined ? data.weight_kg : existing?.weight_kg ?? null,
    notes: data.notes !== undefined ? data.notes : existing?.notes ?? null,
  };

  db.prepare(
    `INSERT INTO entries (date, skin_score, stress, workload, busyness, sleep, food, alcohol, water, workout, reading, weight_kg, notes, updated_at)
     VALUES (@date, @skin_score, @stress, @workload, @busyness, @sleep, @food, @alcohol, @water, @workout, @reading, @weight_kg, @notes, datetime('now'))
     ON CONFLICT(date) DO UPDATE SET
       skin_score = excluded.skin_score,
       stress = excluded.stress,
       workload = excluded.workload,
       busyness = excluded.busyness,
       sleep = excluded.sleep,
       food = excluded.food,
       alcohol = excluded.alcohol,
       water = excluded.water,
       workout = excluded.workout,
       reading = excluded.reading,
       weight_kg = excluded.weight_kg,
       notes = excluded.notes,
       updated_at = datetime('now')`
  ).run(entry);
}
