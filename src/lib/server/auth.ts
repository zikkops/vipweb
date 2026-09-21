import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role, User } from "@/lib/dues";
import { getDb } from "@/lib/server/db";
import { HttpError } from "@/lib/server/http";

const SESSION_COOKIE = "vm_session";
const SESSION_DAYS = 7;

// ---- passwords -----------------------------------------------------------

const SCRYPT = { N: 16384, r: 8, p: 1 } as const;
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEY_LEN, SCRYPT);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, SCRYPT);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// A fixed hash to compare against when the email doesn't exist, so a login
// attempt takes the same time whether or not the account is real.
const DUMMY_HASH = hashPassword(randomBytes(16).toString("hex"));

export function checkPasswordOrDummy(password: string, stored: string | undefined): boolean {
  if (!stored) {
    verifyPassword(password, DUMMY_HASH);
    return false;
  }
  return verifyPassword(password, stored);
}

// ---- sessions ------------------------------------------------------------

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export type UserRow = {
  id: number;
  email: string;
  name: string;
  role: Role;
  created_at: string;
  active: number;
  must_change_password: number;
};

/** Columns for a UserRow, from the `users` table aliased as `u`. */
export const USER_COLUMNS = "u.id, u.email, u.name, u.role, u.created_at, u.active, u.must_change_password";

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    active: row.active === 1,
    mustChangePassword: row.must_change_password === 1,
  };
}

/** Signs someone out everywhere, optionally keeping the session they’re using. */
export async function endOtherSessions(userId: number, keepCurrent: boolean) {
  const token = keepCurrent ? (await cookies()).get(SESSION_COOKIE)?.value : undefined;
  getDb()
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?")
    .run(userId, token ? sha256(token) : "");
}

export const MIN_PASSWORD = 8;

export function checkNewPassword(password: string) {
  if (password.length < MIN_PASSWORD) throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters.`);
}

export async function startSession(userId: number) {
  // Only the hash is stored, so a leaked database cannot be replayed as cookies.
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(sha256(token), userId, expires.toISOString());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());

  const row = db
    .prepare(
      `SELECT ${USER_COLUMNS}
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND u.active = 1`
    )
    .get(sha256(token)) as UserRow | undefined;

  return row ? toUser(row) : null;
}

/** A signed-in user; with `allowPendingPassword` also one who must still replace an admin-issued password. */
export async function requireUser({ allowPendingPassword = false } = {}): Promise<User> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Please sign in.");
  if (user.mustChangePassword && !allowPendingPassword) throw new HttpError(403, "Choose a new password first.");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") throw new HttpError(403, "Admins only.");
  return user;
}
