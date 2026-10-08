import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let sqliteInstance: Database.Database | undefined;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

function resolveDatabasePath() {
  const databasePath = process.env.DATABASE_PATH;
  return databasePath ? path.resolve(/* turbopackIgnore: true */ process.cwd(), databasePath) : path.join(process.cwd(), "data", "ledger.db");
}

function initializeDatabase(database: Database.Database) {
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
      amount INTEGER NOT NULL CHECK (amount >= 0),
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT,
      payment_method TEXT,
      note TEXT,
      source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'text', 'voice', 'image')),
      raw_text TEXT,
      image_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS entries_date_idx ON entries(date);
    CREATE INDEX IF NOT EXISTS entries_type_idx ON entries(type);
    CREATE INDEX IF NOT EXISTS entries_category_idx ON entries(category);

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#1677ff',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (entry_id, tag_id)
    );
  `);
}

export function getSqlite() {
  if (!sqliteInstance) {
    const resolvedDatabasePath = resolveDatabasePath();
    fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });
    sqliteInstance = new Database(resolvedDatabasePath);
    initializeDatabase(sqliteInstance);
  }

  return sqliteInstance;
}

export function getDb() {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(getSqlite(), { schema });
  }

  return drizzleInstance;
}
