import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { endOtherSessions, hashPassword, requireAdmin, toUser, USER_COLUMNS, type UserRow } from "@/lib/server/auth";
import { transaction } from "@/lib/server/db";
import { handle, HttpError, intId, ok, readJson } from "@/lib/server/http";
import { clear } from "@/lib/server/rateLimit";

type Ctx = { params: Promise<{ id: string }> };

function findUser(db: DatabaseSync, id: number): UserRow {
  const row = db.prepare(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = ?`).get(id) as UserRow | undefined;
  if (!row) throw new HttpError(404, "User not found.");
  return row;
}

function assertAnotherAdmin(db: DatabaseSync, id: number) {
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND active = 1 AND id != ?")
    .get(id) as { n: number };
  if (n === 0) throw new HttpError(400, "There must be at least one active admin.");
}

// { role: "admin" | "employee" } or { active: boolean }
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const me = await requireAdmin();
  const id = intId((await params).id, "User id");
  const body = await readJson(req);

  const user = transaction((db) => {
    const existing = findUser(db, id);

    if ("role" in body) {
      const role = body.role;
      if (role !== "admin" && role !== "employee") throw new HttpError(400, "Role must be admin or employee.");
      if (existing.role === "admin" && role === "employee") assertAnotherAdmin(db, id);
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
    }

    if ("active" in body) {
      if (typeof body.active !== "boolean") throw new HttpError(400, "Active must be true or false.");
      if (!body.active) {
        if (id === me.id) throw new HttpError(400, "You can't deactivate your own account.");
        if (existing.role === "admin") assertAnotherAdmin(db, id);
        db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
      }
      db.prepare("UPDATE users SET active = ? WHERE id = ?").run(body.active ? 1 : 0, id);
    }

    return findUser(db, id);
  });

  return ok({ user: toUser(user) });
});

// { action: "reset-password" } → a one-time temporary password, shown to the admin once.
export const POST = handle(async (req: Request, { params }: Ctx) => {
  const me = await requireAdmin();
  const id = intId((await params).id, "User id");
  const { action } = await readJson(req);
  if (action !== "reset-password") throw new HttpError(400, "Unknown action.");
  if (id === me.id) throw new HttpError(400, "Change your own password from your account instead.");

  const temporaryPassword = randomBytes(9).toString("base64url");
  const user = transaction((db) => {
    findUser(db, id);
    db.prepare("UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?").run(
      hashPassword(temporaryPassword),
      id
    );
    return findUser(db, id);
  });
  await endOtherSessions(id, false);
  // The admin has vouched for this reset, so lift any sign-in lockout on the account.
  clear(`login:email:${user.email}`);

  return ok({ user: toUser(user), temporaryPassword });
});
