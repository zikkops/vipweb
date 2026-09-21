import { checkPasswordOrDummy, startSession, toUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { handle, HttpError, ok, readJson, str } from "@/lib/server/http";

export const POST = handle(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, "Email", { max: 254 }).toLowerCase();
  const password = str(body.password, "Password", { max: 200 });

  const row = getDb()
    .prepare("SELECT id, email, name, role, created_at, password_hash FROM users WHERE email = ?")
    .get(email) as (Parameters<typeof toUser>[0] & { password_hash: string }) | undefined;

  if (!checkPasswordOrDummy(password, row?.password_hash) || !row) {
    throw new HttpError(401, "Wrong email or password.");
  }

  await startSession(row.id);
  return ok({ user: toUser(row) });
});
