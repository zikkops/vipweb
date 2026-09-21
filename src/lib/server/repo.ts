import {
  BUCKET_KEYS,
  DATE_RE,
  type Board,
  type BoardItem,
  type BoardStatus,
  type BucketKey,
  type Report,
  type ReportItem,
  type ReportSummary,
  type Tag,
  type TagKind,
} from "@/lib/dues";
import { generateJobCode } from "@/lib/jobCode";
import { getDb, transaction } from "@/lib/server/db";
import { HttpError, intId, str } from "@/lib/server/http";

// ---- tags ----------------------------------------------------------------

const TABLE: Record<TagKind, "brands" | "sections"> = { brand: "brands", section: "sections" };

export function tagKind(value: unknown): TagKind {
  if (value === "brand" || value === "section") return value;
  throw new HttpError(400, "Tag kind must be brand or section.");
}

type TagRow = { id: number; name: string; code: string | null; active: number };
const toTag = (r: TagRow): Tag => ({ id: r.id, name: r.name, code: r.code, active: r.active === 1 });

export function listTags(kind: TagKind): Tag[] {
  const rows = getDb()
    .prepare(`SELECT id, name, code, active FROM ${TABLE[kind]} ORDER BY name COLLATE NOCASE`)
    .all() as TagRow[];
  return rows.map(toTag);
}

function tagCode(value: unknown): string | null {
  const code = str(value, "Code", { max: 12, required: false }).toUpperCase();
  if (code && !/^[A-Z0-9]+$/.test(code)) throw new HttpError(400, "Code can only use letters and numbers.");
  return code || null;
}

function uniqueViolation(err: unknown) {
  return err instanceof Error && /UNIQUE constraint failed/.test(err.message);
}

export function createTag(kind: TagKind, body: Record<string, unknown>): Tag {
  const name = str(body.name, "Name", { max: 80 });
  const code = tagCode(body.code);
  try {
    const row = getDb()
      .prepare(`INSERT INTO ${TABLE[kind]} (name, code) VALUES (?, ?) RETURNING id, name, code, active`)
      .get(name, code) as TagRow;
    return toTag(row);
  } catch (err) {
    if (uniqueViolation(err)) throw new HttpError(409, `“${name}” already exists.`);
    throw err;
  }
}

export function updateTag(kind: TagKind, id: number, body: Record<string, unknown>): Tag {
  const db = getDb();
  const existing = db
    .prepare(`SELECT id, name, code, active FROM ${TABLE[kind]} WHERE id = ?`)
    .get(id) as TagRow | undefined;
  if (!existing) throw new HttpError(404, "Tag not found.");

  const name = "name" in body ? str(body.name, "Name", { max: 80 }) : existing.name;
  const code = "code" in body ? tagCode(body.code) : existing.code;
  const active = "active" in body ? (body.active ? 1 : 0) : existing.active;

  try {
    const row = db
      .prepare(
        `UPDATE ${TABLE[kind]} SET name = ?, code = ?, active = ? WHERE id = ?
         RETURNING id, name, code, active`
      )
      .get(name, code, active, id) as TagRow;
    return toTag(row);
  } catch (err) {
    if (uniqueViolation(err)) throw new HttpError(409, `“${name}” already exists.`);
    throw err;
  }
}

// ---- reports -------------------------------------------------------------

export function reportDate(value: unknown): string {
  if (typeof value !== "string" || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, "Date must be YYYY-MM-DD.");
  }
  return value;
}

type ReportRow = {
  id: number;
  user_id: number;
  report_date: string;
  asana_matches: number | null;
  asana_fix_note: string;
  updated_at: string;
};

type ItemRow = {
  bucket: BucketKey;
  brand_id: number;
  section_id: number;
  job_code: string | null;
  task: string;
  due_date: string | null;
  note: string;
  done: number;
};

function hydrate(row: ReportRow): Report {
  const items = getDb()
    .prepare(
      `SELECT bucket, brand_id, section_id, job_code, task, due_date, note, done
         FROM report_items WHERE report_id = ? ORDER BY position`
    )
    .all(row.id) as ItemRow[];

  return {
    id: row.id,
    userId: row.user_id,
    date: row.report_date,
    asanaMatches: row.asana_matches === null ? null : row.asana_matches === 1,
    asanaFixNote: row.asana_fix_note,
    updatedAt: row.updated_at,
    items: items.map((i) => ({
      bucket: i.bucket,
      brandId: i.brand_id,
      sectionId: i.section_id,
      jobCode: i.job_code,
      task: i.task,
      dueDate: i.due_date,
      note: i.note,
      done: i.done === 1,
    })),
  };
}

export function getReport(userId: number, date: string): Report | null {
  const row = getDb()
    .prepare(
      `SELECT id, user_id, report_date, asana_matches, asana_fix_note, updated_at
         FROM reports WHERE user_id = ? AND report_date = ?`
    )
    .get(userId, date) as ReportRow | undefined;
  return row ? hydrate(row) : null;
}

const MAX_ITEMS = 200;

function parseItems(value: unknown): Omit<ReportItem, "jobCode">[] {
  if (!Array.isArray(value)) throw new HttpError(400, "Items must be a list.");
  if (value.length > MAX_ITEMS) throw new HttpError(400, `A report can have at most ${MAX_ITEMS} rows.`);

  return value.map((raw, i) => {
    const row = `Row ${i + 1}`;
    if (!raw || typeof raw !== "object") throw new HttpError(400, `${row} is invalid.`);
    const item = raw as Record<string, unknown>;

    if (!BUCKET_KEYS.includes(item.bucket as BucketKey)) throw new HttpError(400, `${row}: unknown section.`);
    const dueRaw = str(item.dueDate, `${row} due date`, { max: 10, required: false });
    if (dueRaw && !DATE_RE.test(dueRaw)) throw new HttpError(400, `${row}: due date must be YYYY-MM-DD.`);

    return {
      bucket: item.bucket as BucketKey,
      brandId: intId(item.brandId, `${row} brand`),
      sectionId: intId(item.sectionId, `${row} work section`),
      task: str(item.task, `${row} task`, { max: 300 }),
      dueDate: dueRaw || null,
      note: str(item.note, `${row} note`, { max: 1000, required: false }),
      done: item.done === true,
    };
  });
}

export function saveReport(userId: number, date: string, body: Record<string, unknown>): Report {
  const items = parseItems(body.items);
  const asanaMatches =
    body.asanaMatches === null || body.asanaMatches === undefined ? null : body.asanaMatches === true;
  const asanaFixNote = asanaMatches === false ? str(body.asanaFixNote, "Asana fix note", { max: 2000, required: false }) : "";

  return transaction((db) => {
    const brands = new Map(listTags("brand").map((t) => [t.id, t]));
    const sections = new Map(listTags("section").map((t) => [t.id, t]));

    const now = new Date().toISOString();
    const { id } = db
      .prepare(
        `INSERT INTO reports (user_id, report_date, asana_matches, asana_fix_note, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id, report_date) DO UPDATE SET
           asana_matches = excluded.asana_matches,
           asana_fix_note = excluded.asana_fix_note,
           updated_at = excluded.updated_at
         RETURNING id`
      )
      .get(userId, date, asanaMatches === null ? null : asanaMatches ? 1 : 0, asanaFixNote, now) as { id: number };

    db.prepare("DELETE FROM report_items WHERE report_id = ?").run(id);
    const insert = db.prepare(
      `INSERT INTO report_items (report_id, position, bucket, brand_id, section_id, job_code, task, due_date, note, done)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    items.forEach((item, position) => {
      const brand = brands.get(item.brandId);
      const section = sections.get(item.sectionId);
      if (!brand) throw new HttpError(400, `Row ${position + 1}: that brand no longer exists.`);
      if (!section) throw new HttpError(400, `Row ${position + 1}: that work section no longer exists.`);
      const jobCode = generateJobCode(brand, section, date);
      insert.run(id, position, item.bucket, item.brandId, item.sectionId, jobCode, item.task, item.dueDate, item.note, item.done ? 1 : 0);
    });

    return getReport(userId, date)!;
  });
}

export function reportHistory(userId: number, limit = 60): ReportSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT r.report_date, r.asana_matches, r.updated_at, i.bucket, COUNT(i.id) AS n
         FROM reports r LEFT JOIN report_items i ON i.report_id = r.id
        WHERE r.user_id = ?
        GROUP BY r.id, i.bucket
        ORDER BY r.report_date DESC`
    )
    .all(userId) as {
    report_date: string;
    asana_matches: number | null;
    updated_at: string;
    bucket: BucketKey | null;
    n: number;
  }[];

  const byDate = new Map<string, ReportSummary>();
  for (const r of rows) {
    let summary = byDate.get(r.report_date);
    if (!summary) {
      summary = {
        date: r.report_date,
        asanaMatches: r.asana_matches === null ? null : r.asana_matches === 1,
        updatedAt: r.updated_at,
        counts: { due_today: 0, overdue: 0, coming_up: 0, blocked: 0 },
      };
      byDate.set(r.report_date, summary);
    }
    if (r.bucket) summary.counts[r.bucket] = r.n;
  }
  return [...byDate.values()].slice(0, limit);
}

/** Every user with their report for `date` (or null if they haven't submitted). */
export function reportsForDate(date: string) {
  const users = getDb()
    .prepare("SELECT id, email, name, role FROM users ORDER BY name COLLATE NOCASE")
    .all() as { id: number; email: string; name: string; role: string }[];
  return users.map((u) => ({ user: u, report: getReport(u.id, date) }));
}

/** The user's most recent report before `date`, used to carry open rows forward. */
export function previousReport(userId: number, date: string): Report | null {
  const row = getDb()
    .prepare(
      `SELECT id, user_id, report_date, asana_matches, asana_fix_note, updated_at
         FROM reports WHERE user_id = ? AND report_date < ?
        ORDER BY report_date DESC LIMIT 1`
    )
    .get(userId, date) as ReportRow | undefined;
  return row ? hydrate(row) : null;
}

// ---- board -----------------------------------------------------------------

export function boardStatus(item: { bucket: BucketKey; dueDate: string | null; done: boolean }, date: string): BoardStatus {
  if (item.done) return "done";
  if (item.bucket === "blocked") return "blocked";
  if (!item.dueDate) return item.bucket;
  if (item.dueDate < date) return "overdue";
  if (item.dueDate === date) return "due_today";
  return "coming_up";
}

type BoardRow = ItemRow & {
  id: number;
  user_id: number;
  user_name: string;
  report_date: string;
};

/**
 * Everyone's work as it stood on `date`.
 *
 * Open rows come from each person's latest report on or before that day, since
 * every report restates what is still on their plate. Finished rows come from
 * any report up to that day, so work stays visible as done after it is dropped
 * from later reports — unless the same task is open again in the latest one.
 */
export function board(date: string): Board {
  const db = getDb();
  const columns = `i.id, i.bucket, i.brand_id, i.section_id, i.job_code, i.task, i.due_date, i.note, i.done,
                   r.user_id, u.name AS user_name, r.report_date`;

  const open = db
    .prepare(
      `SELECT ${columns}
         FROM report_items i
         JOIN reports r ON r.id = i.report_id
         JOIN users u ON u.id = r.user_id
        WHERE i.done = 0
          AND r.report_date = (SELECT MAX(report_date) FROM reports WHERE user_id = r.user_id AND report_date <= ?)
        ORDER BY r.user_id, i.position`
    )
    .all(date) as BoardRow[];

  const done = db
    .prepare(
      `SELECT ${columns}
         FROM report_items i
         JOIN reports r ON r.id = i.report_id
         JOIN users u ON u.id = r.user_id
        WHERE i.done = 1 AND r.report_date <= ?
        ORDER BY r.report_date DESC, i.position`
    )
    .all(date) as BoardRow[];

  const key = (r: BoardRow) => `${r.user_id}|${r.brand_id}|${r.section_id}|${r.task.trim().toLowerCase()}`;
  const openKeys = new Set(open.map(key));
  const seenDone = new Set<string>();
  const finished = done.filter((r) => {
    const k = key(r);
    if (openKeys.has(k) || seenDone.has(k)) return false;
    seenDone.add(k);
    return true;
  });

  const items: BoardItem[] = [...open, ...finished].map((r) => {
    const base = { bucket: r.bucket, dueDate: r.due_date, done: r.done === 1 };
    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      brandId: r.brand_id,
      sectionId: r.section_id,
      jobCode: r.job_code,
      task: r.task,
      dueDate: r.due_date,
      note: r.note,
      bucket: r.bucket,
      status: boardStatus(base, date),
      reportDate: r.report_date,
    };
  });

  const people = db
    .prepare(
      `SELECT u.id, u.name,
              (SELECT MAX(report_date) FROM reports WHERE user_id = u.id AND report_date <= ?) AS latestReport
         FROM users u ORDER BY u.name COLLATE NOCASE`
    )
    .all(date) as Board["people"];

  return { date, items, people };
}
