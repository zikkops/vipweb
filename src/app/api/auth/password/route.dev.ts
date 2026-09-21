import { checkNewPassword, endOtherSessions, hashPassword, requireUser, verifyPassword } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { handle, HttpError, ok, readJson, str } from "@/lib/server/http";

// Change my own password. Signs out my other devices.
export const POST = handle(async (req: Request) => {
  const user = await requireUser({ allowPendingPassword: true });
  const body = await readJson(req);
  const current = str(body.currentPassword, "Current password", { max: 200 });
  const next = str(body.newPassword, "New password", { max: 200 });

  const { password_hash } = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as {
    password_hash: string;
  };
  if (!verifyPassword(current, password_hash)) throw new HttpError(400, "Your current password is wrong.");
  checkNewPassword(next);
  if (next === current) throw new HttpError(400, "Pick a password different from the current one.");

  getDb()
    .prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?")
    .run(hashPassword(next), user.id);
  await endOtherSessions(user.id, true);
  return ok({ user: { ...user, mustChangePassword: false } });
});
