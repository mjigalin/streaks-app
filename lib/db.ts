import Database from "better-sqlite3";
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

    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
  `);
}

function seedUser(database: Database.Database): void {
  const email = process.env.USER_EMAIL;
  const passwordHash = process.env.USER_PASSWORD_HASH;

  if (!email || !passwordHash) return;

  const existing = database
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);

  if (!existing) {
    database
      .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
      .run(email, passwordHash);
  }
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
