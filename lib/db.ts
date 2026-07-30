import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    const dir = path.dirname(configured);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return configured;
  }
  const localDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return path.join(localDir, "streaks.db");
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    -- Legacy health metrics (parked, kept for history)
    CREATE TABLE IF NOT EXISTS entries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT NOT NULL UNIQUE,
      skin_score    INTEGER,
      stress        INTEGER,
      workload      INTEGER,
      busyness      TEXT,
      sleep         TEXT,
      food          TEXT,
      alcohol       INTEGER DEFAULT 0,
      water         INTEGER DEFAULT 0,
      workout       INTEGER DEFAULT 0,
      reading       INTEGER DEFAULT 0,
      weight_kg     REAL,
      notes         TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      date          TEXT NOT NULL,
      habit_id      TEXT NOT NULL,
      completed     INTEGER NOT NULL DEFAULT 0,
      completed_at  TEXT,
      value         REAL,
      PRIMARY KEY (date, habit_id)
    );

    CREATE TABLE IF NOT EXISTS weekly_completions (
      week_start    TEXT NOT NULL,
      goal_id       TEXT NOT NULL,
      completed     INTEGER NOT NULL DEFAULT 0,
      completed_at  TEXT,
      PRIMARY KEY (week_start, goal_id)
    );

    CREATE TABLE IF NOT EXISTS dismissed_prompts (
      week_start    TEXT NOT NULL,
      prompt_id     TEXT NOT NULL,
      dismissed_at  TEXT,
      PRIMARY KEY (week_start, prompt_id)
    );

    CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
  `);
}

function seedUser(database: Database.Database): void {
  const email = process.env.USER_EMAIL;
  let passwordHash = process.env.USER_PASSWORD_HASH;

  // Plain USER_PASSWORD avoids $ mangling in Railway/env files
  if (process.env.USER_PASSWORD) {
    passwordHash = bcrypt.hashSync(process.env.USER_PASSWORD, 10);
  }

  if (!email || !passwordHash) return;

  database
    .prepare(
      `INSERT INTO users (email, password_hash) VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`
    )
    .run(email, passwordHash);
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDatabasePath());
    db.pragma("journal_mode = WAL");
    initSchema(db);
    seedUser(db);
  }
  return db;
}
