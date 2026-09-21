import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { clients } from "@/data/clients";

// Local SQLite database for testing the daily-dues workflow before it moves
// online. Only ever imported from `*.dev.ts` API routes, so it never reaches
// the static production build.

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "dues.sqlite");

const SCHEMA_VERSION = 2;

function migrate(db: DatabaseSync) {
  const { user_version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  if (user_version >= SCHEMA_VERSION) return;

  if (user_version < 1) createTables(db);
  // v2: rows can be ticked off, so admins can see finished work on the board.
  if (user_version < 2) db.exec("ALTER TABLE report_items ADD COLUMN done INTEGER NOT NULL DEFAULT 0");

  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

function createTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE users (
      id            INTEGER PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE brands (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
      code       TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE sections (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
      code       TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE reports (
      id             INTEGER PRIMARY KEY,
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_date    TEXT NOT NULL,
      asana_matches  INTEGER CHECK (asana_matches IN (0, 1)),
      asana_fix_note TEXT NOT NULL DEFAULT '',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, report_date)
    );

    CREATE TABLE report_items (
      id         INTEGER PRIMARY KEY,
      report_id  INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      position   INTEGER NOT NULL,
      bucket     TEXT NOT NULL CHECK (bucket IN ('due_today', 'overdue', 'coming_up', 'blocked')),
      brand_id   INTEGER NOT NULL REFERENCES brands(id),
      section_id INTEGER NOT NULL REFERENCES sections(id),
      job_code   TEXT,
      task       TEXT NOT NULL,
      due_date   TEXT,
      note       TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX idx_reports_date ON reports(report_date);
    CREATE INDEX idx_items_report ON report_items(report_id);
  `);

  seed(db);
}

function seed(db: DatabaseSync) {
  // Codes only where the existing job codes make them unambiguous
  // (EVC-…-WEB, BDF-…-EVENT, NTR-…-CRV). Everything else is left for admins.
  const knownBrandCodes: Record<string, string> = { "Beirut Duty Free": "BDF" };
  const insertBrand = db.prepare("INSERT OR IGNORE INTO brands (name, code) VALUES (?, ?)");
  for (const c of clients) insertBrand.run(c.name, knownBrandCodes[c.name] ?? null);
  insertBrand.run("Eventcom", "EVC");
  insertBrand.run("Naturea", "NTR");

  const insertSection = db.prepare("INSERT OR IGNORE INTO sections (name, code) VALUES (?, ?)");
  for (const [name, code] of [
    ["Website", "WEB"],
    ["Branding", "CRV"],
    ["Event Kit", "EVENT"],
    ["Design", null],
    ["Social Media", null],
    ["App", null],
  ] as const) {
    insertSection.run(name, code);
  }
}

function open(): DatabaseSync {
  mkdirSync(DB_DIR, { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  migrate(db);
  return db;
}

// Reuse one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __duesDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.__duesDb) globalForDb.__duesDb = open();
  return globalForDb.__duesDb;
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
