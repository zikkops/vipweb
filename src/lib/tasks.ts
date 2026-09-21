// Tasks for the daily-dues dashboard, shared by the pages and the API.
//
// A task is saved once and lives until it is done. Nobody files it under a
// section: where it stands is worked out from its dates every time it is
// shown. Everything here works on plain YYYY-MM-DD strings in the viewer's
// local time, so the rules are easy to test and never depend on a clock.

export type TaskStatus = "overdue" | "due_today" | "blocked" | "coming_up" | "done";

/** Display order, most urgent first. */
export const TASK_STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "overdue", label: "Overdue" },
  { key: "due_today", label: "Due today" },
  { key: "blocked", label: "Blocked" },
  { key: "coming_up", label: "Coming up" },
  { key: "done", label: "Done" },
];

export type TaskBlock = {
  id: number;
  reason: string;
  /** Who or what the task is waiting on, e.g. "Images from designer". */
  waitingOn: string;
  blockedOn: string;
  /** The day the Received tick was given; null while still blocked. */
  receivedOn: string | null;
};

export type Task = {
  id: number;
  userId: number;
  userName: string;
  brandId: number;
  sectionId: number;
  title: string;
  dueDate: string | null;
  jobCode: string | null;
  createdOn: string;
  doneOn: string | null;
  blocks: TaskBlock[];
  updatedAt: string;
};

export type TaskEventType =
  | "created"
  | "edited"
  | "due_changed"
  | "job_code_changed"
  | "blocked"
  | "received"
  | "done"
  | "reopened";

export type TaskEvent = {
  id: number;
  type: TaskEventType;
  fromValue: string | null;
  toValue: string | null;
  note: string;
  at: string;
  userName: string;
};

export type Checkin = { date: string; asanaMatches: boolean; asanaFixNote: string; updatedAt: string };

type StatusInput = Pick<Task, "dueDate" | "doneOn" | "blocks">;

/** The block in force on `day`, if any. */
export function activeBlock(task: Pick<Task, "blocks">, day: string): TaskBlock | null {
  return (
    task.blocks.find((b) => b.blockedOn <= day && (b.receivedOn === null || b.receivedOn > day)) ?? null
  );
}

/**
 * Where a task stands on `day`:
 * done → blocked (not yet received) → overdue / due today / coming up by due date.
 * A task with no due date counts as coming up.
 */
export function taskStatus(task: StatusInput, day: string): TaskStatus {
  if (task.doneOn !== null && task.doneOn <= day) return "done";
  if (activeBlock(task, day)) return "blocked";
  if (!task.dueDate) return "coming_up";
  if (task.dueDate < day) return "overdue";
  if (task.dueDate === day) return "due_today";
  return "coming_up";
}

/**
 * Moving the due date of a late task later needs a reason ("new date and
 * why"), so admins can see why work slipped.
 */
export function needsSlipReason(task: StatusInput, newDueDate: string | null, today: string): boolean {
  if (task.doneOn !== null || !task.dueDate || task.dueDate >= today) return false;
  return newDueDate === null || newDueDate > task.dueDate;
}

/** A Date as YYYY-MM-DD in local time. */
export function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
