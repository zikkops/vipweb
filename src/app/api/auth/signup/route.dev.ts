import { COMPANY_DOMAIN, isAllowedEmail } from "@/lib/dues";
import { hashPassword, startSession, toUser } from "@/lib/server/auth";
import { transaction } from "@/lib/server/db";
import { handle, HttpError, ok, readJson, str } from "@/lib/server/http";

export const POST = handle(async (req: Request) => {
  const body = await readJson(req);
  const name = str(body.name, "Name", { max: 80 });
  const email = str(body.email, "Email", { max: 254 }).toLowerCase();
  const password = str(body.password, "Password", { max: 200 });

  if (!/^[^\s@]+@[^\s@]+$/.test(email) || !isAllowedEmail(email)) {
    throw new HttpError(400, `Use your @${COMPANY_DOMAIN} email address.`);
  }
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");

  const user = transaction((db) => {
    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
      throw new HttpError(409, "An account with this email already exists.");
    }
    // The very first account becomes the admin so someone can manage the rest.
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    return db
      .prepare(
        `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)
         RETURNING id, email, name, role, created_at`
      )
      .get(email, name, hashPassword(password), n === 0 ? "admin" : "employee") as Parameters<typeof toUser>[0];
  });

  await startSession(user.id);
  return ok({ user: toUser(user) }, 201);
});
