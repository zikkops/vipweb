// Shared by the dashboard UI and the local test API.

export const COMPANY_DOMAIN = "vipminds.com";

// Addresses outside the company domain that may still create an account.
export const EXTRA_ALLOWED_EMAILS = ["mark.zakkak@gmail.com"];

export type Role = "employee" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  /** Deactivated accounts can’t sign in; their tasks stay for the record. */
  active: boolean;
  /** Set after an admin resets the password, until the person picks a new one. */
  mustChangePassword: boolean;
};

export type TagKind = "brand" | "section";

export type Tag = {
  id: number;
  name: string;
  /** Short code used in job codes, e.g. BDF or WEB. A task gets no code until both its tags have one. */
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
