import { COMPANY_DOMAIN, isAllowedEmail } from "@/lib/dues";
import { checkNewPassword, hashPassword, startSession, toUser, type UserRow } from "@/lib/server/auth";
import { transaction } from "@/lib/server/db";
import { handle, HttpError, ok, readJson, str } from "@/lib/server/http";
import { assertAllowed, clientIp, recordFailure, SIGNUP_WINDOW } from "@/lib/server/rateLimit";

export const POST = handle(async (req: Request) => {
  const body = await readJson(req);
  const name = str(body.name, "Name", { max: 80 });
  const email = str(body.email, "Email", { max: 254 }).toLowerCase();
  const password = str(body.password, "Password", { max: 200 });

  const ipKey = `signup:ip:${clientIp(req)}`;
  assertAllowed([ipKey], SIGNUP_WINDOW);

  if (!/^[^\s@]+@[^\s@]+$/.test(email) || !isAllowedEmail(email)) {
    throw new HttpError(400, `Use your @${COMPANY_DOMAIN} email address.`);
  }
  checkNewPassword(password);

  const user = transaction((db) => {
    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
      throw new HttpError(409, "An account with this email already exists.");
    }
    // The very first account becomes the admin so someone can manage the rest.
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    return db
      .prepare(
        `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)
         RETURNING id, email, name, role, created_at, active, must_change_password`
      )
      .get(email, name, hashPassword(password), n === 0 ? "admin" : "employee") as UserRow;
  });

  // Each account created counts toward the limit, so one address can't mass-create accounts.
  recordFailure([ipKey]);
  await startSession(user.id);
  return ok({ user: toUser(user) }, 201);
});
