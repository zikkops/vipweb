import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { clients } from "@/data/clients";

// Local SQLite database for testing the daily-dues workflow before it moves
// online. Only ever imported from `*.dev.ts` API routes, so it never reaches
// the static production build.

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "dues.sqlite");

const SCHEMA_VERSION = 5;

function migrate(db: DatabaseSync) {
  const { user_version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  if (user_version >= SCHEMA_VERSION) return;

  if (user_version < 1) createTables(db);
  // v2: rows can be ticked off, so admins can see finished work on the board.
  if (user_version < 2) db.exec("ALTER TABLE report_items ADD COLUMN done INTEGER NOT NULL DEFAULT 0");
  // v3: tasks that live until done, instead of rows re-filed in each daily report.
  if (user_version < 3) createTaskTables(db);
  // v4: daily reports are retired; their open work carries on as tasks.
  if (user_version < 4) {
    db.exec("BEGIN");
    try {
      reportsToTasks(db);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
  // v5: accounts can be deactivated, and an admin-issued password must be changed.
  if (user_version < 5) {
    db.exec(`
      ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
    `);
  }

  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

/**
 * Turns each person's latest daily report into tasks (ticked rows become done
 * tasks, Blocked rows become blocked tasks), then drops the report tables.
 */
function reportsToTasks(db: DatabaseSync) {
  const rows = db
    .prepare(
      `SELECT r.user_id, r.report_date, i.bucket, i.brand_id, i.section_id, i.job_code, i.task, i.due_date, i.note, i.done
         FROM reports r JOIN report_items i ON i.report_id = r.id
        WHERE r.report_date = (SELECT MAX(report_date) FROM reports WHERE user_id = r.user_id)
        ORDER BY r.user_id, i.position`
    )
    .all() as {
    user_id: number;
    report_date: string;
    bucket: string;
    brand_id: number;
    section_id: number;
    job_code: string | null;
    task: string;
    due_date: string | null;
    note: string;
    done: number;
  }[];

  const insertTask = db.prepare(
    `INSERT INTO tasks (user_id, brand_id, section_id, title, due_date, job_code, created_on, done_on)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  );
  const insertBlock = db.prepare("INSERT INTO task_blocks (task_id, reason, blocked_on) VALUES (?, ?, ?)");
  const insertEvent = db.prepare("INSERT INTO task_events (task_id, user_id, type, to_value, note) VALUES (?, ?, ?, ?, ?)");

  for (const r of rows) {
    const done = r.done === 1;
    const { id } = insertTask.get(
      r.user_id,
      r.brand_id,
      r.section_id,
      r.task,
      r.due_date,
      r.job_code,
      r.report_date,
      done ? r.report_date : null
    ) as { id: number };
    insertEvent.run(id, r.user_id, "created", r.job_code, `Imported from the daily report of ${r.report_date}${r.note ? ` — ${r.note}` : ""}`);
    if (r.bucket === "blocked" && !done) {
      insertBlock.run(id, r.note || "Blocked (from the daily report)", r.report_date);
      insertEvent.run(id, r.user_id, "blocked", null, r.note || "Blocked (from the daily report)");
    }
    if (done) insertEvent.run(id, r.user_id, "done", null, "");
  }

  db.exec("DROP TABLE report_items; DROP TABLE reports;");
}

function createTaskTables(db: DatabaseSync) {
  // Dates that decide a task's status (created_on, due_date, done_on,
  // blocked_on, received_on) are the user's local YYYY-MM-DD; the *_at
  // columns are UTC timestamps kept for the history log.
  db.exec(`
    CREATE TABLE tasks (
      id         INTEGER PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      brand_id   INTEGER NOT NULL REFERENCES brands(id),
      section_id INTEGER NOT NULL REFERENCES sections(id),
      title      TEXT NOT NULL,
      due_date   TEXT,
      job_code   TEXT,
      created_on TEXT NOT NULL,
      done_on    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE task_blocks (
      id          INTEGER PRIMARY KEY,
      task_id     INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      reason      TEXT NOT NULL,
      waiting_on  TEXT NOT NULL DEFAULT '',
      blocked_on  TEXT NOT NULL,
      received_on TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE task_events (
      id         INTEGER PRIMARY KEY,
      task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL CHECK (type IN
                   ('created', 'edited', 'due_changed', 'job_code_changed', 'blocked', 'received', 'done', 'reopened')),
      from_value TEXT,
      to_value   TEXT,
      note       TEXT NOT NULL DEFAULT '',
      at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE checkins (
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date           TEXT NOT NULL,
      asana_matches  INTEGER NOT NULL CHECK (asana_matches IN (0, 1)),
      asana_fix_note TEXT NOT NULL DEFAULT '',
      updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, date)
    );

    CREATE INDEX idx_tasks_user ON tasks(user_id);
    CREATE INDEX idx_tasks_due ON tasks(due_date);
    CREATE INDEX idx_blocks_task ON task_blocks(task_id);
    CREATE INDEX idx_events_task ON task_events(task_id);
  `);
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
