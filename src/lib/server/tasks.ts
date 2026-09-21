import type { DatabaseSync } from "node:sqlite";
import { DATE_RE, localToday, type Tag, type User } from "@/lib/dues";
import { jobCode } from "@/lib/jobCode";
import { getDb, transaction } from "@/lib/server/db";
import { HttpError, intId, str } from "@/lib/server/http";
import { listTags } from "@/lib/server/repo";
import {
  activeBlock,
  needsSlipReason,
  type Checkin,
  type Task,
  type TaskBlock,
  type TaskEvent,
  type TaskEventType,
} from "@/lib/tasks";

// ---- input helpers --------------------------------------------------------

export function parseDay(value: unknown, field: string): string {
  if (typeof value !== "string" || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, `${field} must be a date (YYYY-MM-DD).`);
  }
  return value;
}

function optionalDay(value: unknown, field: string): string | null {
  return value === null || value === undefined || value === "" ? null : parseDay(value, field);
}

/**
 * The caller's local date. Statuses follow the person's own calendar, so the
 * browser sends it; the server's date is only a fallback.
 */
export function today(value: unknown): string {
  return value === undefined || value === null ? localToday() : parseDay(value, "Today");
}

// ---- reading --------------------------------------------------------------

type TaskRow = {
  id: number;
  user_id: number;
  user_name: string;
  brand_id: number;
  section_id: number;
  title: string;
  due_date: string | null;
  job_code: string | null;
  created_on: string;
  done_on: string | null;
  updated_at: string;
};

type BlockRow = {
  id: number;
  task_id: number;
  reason: string;
  waiting_on: string;
  blocked_on: string;
  received_on: string | null;
};

const TASK_COLUMNS = `t.id, t.user_id, u.name AS user_name, t.brand_id, t.section_id, t.title, t.due_date,
                      t.job_code, t.created_on, t.done_on, t.updated_at`;

function withBlocks(db: DatabaseSync, rows: TaskRow[]): Task[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const blocks = db
    .prepare(
      `SELECT id, task_id, reason, waiting_on, blocked_on, received_on FROM task_blocks
        WHERE task_id IN (${ids.map(() => "?").join(",")}) ORDER BY blocked_on, id`
    )
    .all(...ids) as BlockRow[];

  const byTask = new Map<number, TaskBlock[]>();
  for (const b of blocks) {
    const list = byTask.get(b.task_id) ?? [];
    list.push({ id: b.id, reason: b.reason, waitingOn: b.waiting_on, blockedOn: b.blocked_on, receivedOn: b.received_on });
    byTask.set(b.task_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    brandId: r.brand_id,
    sectionId: r.section_id,
    title: r.title,
    dueDate: r.due_date,
    jobCode: r.job_code,
    createdOn: r.created_on,
    doneOn: r.done_on,
    blocks: byTask.get(r.id) ?? [],
    updatedAt: r.updated_at,
  }));
}

/** One person's tasks, or everyone's when `userId` is null. */
export function listTasks(userId: number | null): Task[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ${TASK_COLUMNS} FROM tasks t JOIN users u ON u.id = t.user_id
        WHERE (? IS NULL OR t.user_id = ?)
        ORDER BY t.due_date IS NULL, t.due_date, t.id`
    )
    .all(userId, userId) as TaskRow[];
  return withBlocks(db, rows);
}

function findTask(db: DatabaseSync, id: number): Task {
  const row = db
    .prepare(`SELECT ${TASK_COLUMNS} FROM tasks t JOIN users u ON u.id = t.user_id WHERE t.id = ?`)
    .get(id) as TaskRow | undefined;
  if (!row) throw new HttpError(404, "Task not found.");
  return withBlocks(db, [row])[0];
}

/** A task the user may read: their own, or any task for an admin. */
export function readableTask(user: User, id: number): Task {
  const task = findTask(getDb(), id);
  if (task.userId !== user.id && user.role !== "admin") throw new HttpError(404, "Task not found.");
  return task;
}

export function taskEvents(taskId: number): TaskEvent[] {
  const rows = getDb()
    .prepare(
      `SELECT e.id, e.type, e.from_value, e.to_value, e.note, e.at, u.name AS user_name
         FROM task_events e JOIN users u ON u.id = e.user_id
        WHERE e.task_id = ? ORDER BY e.at DESC, e.id DESC`
    )
    .all(taskId) as {
    id: number;
    type: TaskEventType;
    from_value: string | null;
    to_value: string | null;
    note: string;
    at: string;
    user_name: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    fromValue: r.from_value,
    toValue: r.to_value,
    note: r.note,
    // SQLite's datetime('now') is UTC without a zone marker.
    at: r.at.includes("T") ? r.at : `${r.at.replace(" ", "T")}Z`,
    userName: r.user_name,
  }));
}

// ---- writing --------------------------------------------------------------

function logEvent(
  db: DatabaseSync,
  taskId: number,
  userId: number,
  type: TaskEventType,
  { from = null, to = null, note = "" }: { from?: string | null; to?: string | null; note?: string } = {}
) {
  db.prepare("INSERT INTO task_events (task_id, user_id, type, from_value, to_value, note) VALUES (?, ?, ?, ?, ?, ?)").run(
    taskId,
    userId,
    type,
    from,
    to,
    note
  );
}

function touch(db: DatabaseSync, taskId: number) {
  db.prepare("UPDATE tasks SET updated_at = datetime('now') WHERE id = ?").run(taskId);
}

function activeTag(tags: Tag[], id: number, what: string): Tag {
  const tag = tags.find((t) => t.id === id);
  if (!tag) throw new HttpError(400, `That ${what} doesn't exist.`);
  return tag;
}

export function createTask(user: User, body: Record<string, unknown>): Task {
  const createdOn = today(body.today);
  const brand = activeTag(listTags("brand"), intId(body.brandId, "Brand"), "brand");
  const section = activeTag(listTags("section"), intId(body.sectionId, "Work section"), "work section");
  if (!brand.active || !section.active) throw new HttpError(400, "That brand or work section is archived.");
  const title = str(body.title, "Task", { max: 300 });
  const dueDate = optionalDay(body.dueDate, "Due date");
  const code = jobCode(brand, section, createdOn).code;

  return transaction((db) => {
    const { id } = db
      .prepare(
        `INSERT INTO tasks (user_id, brand_id, section_id, title, due_date, job_code, created_on)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
      )
      .get(user.id, brand.id, section.id, title, dueDate, code, createdOn) as { id: number };
    logEvent(db, id, user.id, "created", { to: code });
    return findTask(db, id);
  });
}

/** A task the user may change: only their own. */
function ownTask(db: DatabaseSync, user: User, id: number): Task {
  const task = findTask(db, id);
  if (task.userId !== user.id) throw new HttpError(403, "You can only change your own tasks.");
  return task;
}

export function updateTask(user: User, id: number, body: Record<string, unknown>): Task {
  const now = today(body.today);
  const brands = listTags("brand");
  const sections = listTags("section");

  return transaction((db) => {
    const task = ownTask(db, user, id);
    const brand = "brandId" in body ? activeTag(brands, intId(body.brandId, "Brand"), "brand") : activeTag(brands, task.brandId, "brand");
    const section =
      "sectionId" in body
        ? activeTag(sections, intId(body.sectionId, "Work section"), "work section")
        : activeTag(sections, task.sectionId, "work section");
    const title = "title" in body ? str(body.title, "Task", { max: 300 }) : task.title;
    const dueDate = "dueDate" in body ? optionalDay(body.dueDate, "Due date") : task.dueDate;
    const note = str(body.reason, "Reason", { max: 1000, required: false });

    if (dueDate !== task.dueDate && needsSlipReason(task, dueDate, now) && !note) {
      throw new HttpError(400, "This task is overdue — say why the date is moving.");
    }

    // The code keeps the month the task was opened; only brand/section move it.
    const code = brand.id !== task.brandId || section.id !== task.sectionId ? jobCode(brand, section, task.createdOn).code : task.jobCode;

    db.prepare(
      `UPDATE tasks SET brand_id = ?, section_id = ?, title = ?, due_date = ?, job_code = ?, updated_at = datetime('now')
        WHERE id = ?`
    ).run(brand.id, section.id, title, dueDate, code, id);

    if (dueDate !== task.dueDate) logEvent(db, id, user.id, "due_changed", { from: task.dueDate, to: dueDate, note });
    if (code !== task.jobCode) logEvent(db, id, user.id, "job_code_changed", { from: task.jobCode, to: code });
    const changed = [
      title !== task.title && "task",
      brand.id !== task.brandId && "brand",
      section.id !== task.sectionId && "work section",
    ].filter(Boolean);
    if (changed.length) logEvent(db, id, user.id, "edited", { note: `Changed ${changed.join(", ")}` });

    return findTask(db, id);
  });
}

export type TaskAction = "done" | "reopen" | "block" | "receive";

export function taskAction(user: User, id: number, body: Record<string, unknown>): Task {
  const now = today(body.today);
  const action = body.action as TaskAction;

  return transaction((db) => {
    const task = ownTask(db, user, id);
    const open = activeBlock(task, now);

    switch (action) {
      case "done":
        if (task.doneOn) throw new HttpError(409, "This task is already done.");
        db.prepare("UPDATE tasks SET done_on = ? WHERE id = ?").run(now, id);
        logEvent(db, id, user.id, "done");
        break;

      case "reopen":
        if (!task.doneOn) throw new HttpError(409, "This task isn't done.");
        db.prepare("UPDATE tasks SET done_on = NULL WHERE id = ?").run(id);
        logEvent(db, id, user.id, "reopened");
        break;

      case "block": {
        if (task.doneOn) throw new HttpError(409, "A finished task can't be blocked.");
        if (task.blocks.some((b) => b.receivedOn === null)) throw new HttpError(409, "This task is already blocked.");
        const reason = str(body.reason, "Reason", { max: 1000 });
        const waitingOn = str(body.waitingOn, "Waiting on", { max: 200, required: false });
        const blockedOn = body.blockedOn ? parseDay(body.blockedOn, "Blocked since") : now;
        if (blockedOn > now) throw new HttpError(400, "The blocked date can't be in the future.");
        db.prepare("INSERT INTO task_blocks (task_id, reason, waiting_on, blocked_on) VALUES (?, ?, ?, ?)").run(
          id,
          reason,
          waitingOn,
          blockedOn
        );
        logEvent(db, id, user.id, "blocked", { to: waitingOn || null, note: reason, from: blockedOn });
        break;
      }

      case "receive": {
        const pending = open ?? task.blocks.find((b) => b.receivedOn === null);
        if (!pending) throw new HttpError(409, "This task isn't blocked.");
        db.prepare("UPDATE task_blocks SET received_on = ? WHERE id = ?").run(now, pending.id);
        logEvent(db, id, user.id, "received", { to: pending.waitingOn || null, note: pending.reason });
        break;
      }

      default:
        throw new HttpError(400, "Unknown action.");
    }

    touch(db, id);
    return findTask(db, id);
  });
}

// ---- daily check-in ---------------------------------------------------------

type CheckinRow = { date: string; asana_matches: number; asana_fix_note: string; updated_at: string };
const toCheckin = (r: CheckinRow): Checkin => ({
  date: r.date,
  asanaMatches: r.asana_matches === 1,
  asanaFixNote: r.asana_fix_note,
  updatedAt: r.updated_at,
});

export function getCheckin(userId: number, date: string): Checkin | null {
  const row = getDb()
    .prepare("SELECT date, asana_matches, asana_fix_note, updated_at FROM checkins WHERE user_id = ? AND date = ?")
    .get(userId, date) as CheckinRow | undefined;
  return row ? toCheckin(row) : null;
}

export function saveCheckin(userId: number, body: Record<string, unknown>): Checkin {
  const date = parseDay(body.date, "Date");
  if (typeof body.asanaMatches !== "boolean") throw new HttpError(400, "Answer yes or no.");
  const fixNote = body.asanaMatches ? "" : str(body.asanaFixNote, "What you fixed", { max: 2000 });
  getDb()
    .prepare(
      `INSERT INTO checkins (user_id, date, asana_matches, asana_fix_note) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, date) DO UPDATE SET
         asana_matches = excluded.asana_matches, asana_fix_note = excluded.asana_fix_note, updated_at = datetime('now')`
    )
    .run(userId, date, body.asanaMatches ? 1 : 0, fixNote);
  return getCheckin(userId, date)!;
}

/** Everyone, with their check-in for `date` (null if they haven't). */
export function checkinsFor(date: string) {
  const users = getDb().prepare("SELECT id, name FROM users ORDER BY name COLLATE NOCASE").all() as {
    id: number;
    name: string;
  }[];
  return users.map((u) => ({ userId: u.id, name: u.name, checkin: getCheckin(u.id, date) }));
}
