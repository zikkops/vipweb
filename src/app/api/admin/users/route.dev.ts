import { requireAdmin, toUser, USER_COLUMNS, type UserRow } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { handle, ok } from "@/lib/server/http";

export const GET = handle(async () => {
  await requireAdmin();
  const rows = getDb()
    .prepare(`SELECT ${USER_COLUMNS} FROM users u ORDER BY u.active DESC, u.name COLLATE NOCASE`)
    .all() as UserRow[];
  return ok({ users: rows.map(toUser) });
});
