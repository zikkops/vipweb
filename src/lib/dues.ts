// Shared by the dashboard UI and the local test API.

export const COMPANY_DOMAIN = "vipminds.com";

// Addresses outside the company domain that may still create an account.
export const EXTRA_ALLOWED_EMAILS = ["mark.zakkak@gmail.com"];

export const BUCKETS = [
  { key: "due_today", label: "Due today" },
  { key: "overdue", label: "Overdue" },
  { key: "coming_up", label: "Coming up" },
  { key: "blocked", label: "Blocked" },
] as const;

export type BucketKey = (typeof BUCKETS)[number]["key"];

export const BUCKET_KEYS: readonly BucketKey[] = BUCKETS.map((b) => b.key);

export type Role = "employee" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
};

export type TagKind = "brand" | "section";

export type Tag = {
  id: number;
  name: string;
  /** Short code used in job codes, e.g. BDF or WEB. Optional until rules are set. */
  code: string | null;
  active: boolean;
};

export type ReportItem = {
  bucket: BucketKey;
  brandId: number;
  sectionId: number;
  /** Generated from rules that are not defined yet, so null for now. */
  jobCode: string | null;
  task: string;
  dueDate: string | null;
  note: string;
  done: boolean;
};

export type Report = {
  id: number;
  userId: number;
  date: string;
  asanaMatches: boolean | null;
  asanaFixNote: string;
  items: ReportItem[];
  updatedAt: string;
};

export type ReportSummary = {
  date: string;
  asanaMatches: boolean | null;
  counts: Record<BucketKey, number>;
  updatedAt: string;
};

/**
 * Where a row stands on a given day. Done and blocked come from the employee;
 * the rest follow the due date, falling back to the section they filed it in.
 */
export type BoardStatus = "overdue" | "due_today" | "coming_up" | "blocked" | "done";

export const BOARD_STATUSES: { key: BoardStatus; label: string }[] = [
  { key: "overdue", label: "Late" },
  { key: "due_today", label: "Due today" },
  { key: "blocked", label: "Blocked" },
  { key: "coming_up", label: "Coming up" },
  { key: "done", label: "Done" },
];

export type BoardItem = {
  id: number;
  userId: number;
  userName: string;
  brandId: number;
  sectionId: number;
  jobCode: string | null;
  task: string;
  dueDate: string | null;
  note: string;
  bucket: BucketKey;
  status: BoardStatus;
  /** The report this row was last seen in. */
  reportDate: string;
};

export type BoardPerson = { id: number; name: string; latestReport: string | null };

export type Board = { date: string; items: BoardItem[]; people: BoardPerson[] };

/** Today's date in the browser's/server's local time as YYYY-MM-DD. */
export function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${COMPANY_DOMAIN}`) || EXTRA_ALLOWED_EMAILS.includes(normalized);
}
