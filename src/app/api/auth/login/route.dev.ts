import { checkPasswordOrDummy, startSession, toUser, USER_COLUMNS, type UserRow } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { handle, HttpError, ok, readJson, str } from "@/lib/server/http";
import { assertAllowed, clear, clientIp, LOGIN_WINDOW, recordFailure } from "@/lib/server/rateLimit";

export const POST = handle(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, "Email", { max: 254 }).toLowerCase();
  const password = str(body.password, "Password", { max: 200 });

  // Limit guesses per account and per address, so neither one account nor
  // a sweep across many accounts can be brute-forced.
  const keys = [`login:email:${email}`, `login:ip:${clientIp(req)}`];
  assertAllowed(keys, LOGIN_WINDOW);

  const row = getDb()
    .prepare(`SELECT ${USER_COLUMNS}, u.password_hash FROM users u WHERE u.email = ?`)
    .get(email) as (UserRow & { password_hash: string }) | undefined;

  if (!checkPasswordOrDummy(password, row?.password_hash) || !row) {
    recordFailure(keys);
    throw new HttpError(401, "Wrong email or password.");
  }
  if (!row.active) throw new HttpError(403, "This account has been deactivated. Ask an admin to turn it back on.");

  clear(keys[0]);
  await startSession(row.id);
  return ok({ user: toUser(row) });
});
