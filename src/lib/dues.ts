// Shared by the dashboard and its tests.

export const COMPANY_DOMAIN = "vipminds.com";

// Addresses outside the company domain that may still create an account.
// The database enforces this too (public.allowed_emails); keep both in step.
export const EXTRA_ALLOWED_EMAILS = ["mark.zakkak@gmail.com"];

export type Role = "employee" | "admin";

export type User = {
  /** Supabase Auth user id. */
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  /** Deactivated accounts can’t sign in; their tasks stay for the record. */
  active: boolean;
};

export type TagKind = "brand" | "section";

export type Tag = {
  id: number;
  name: string;
  /** Code used in job codes: a client's 2–3 letters (BDF) or a type of work (SOC). A task gets no code until its client has one. */
  code: string | null;
  active: boolean;
};

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
