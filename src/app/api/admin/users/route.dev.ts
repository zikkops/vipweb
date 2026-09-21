import { requireAdmin, toUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { handle, ok } from "@/lib/server/http";

export const GET = handle(async () => {
  await requireAdmin();
  const rows = getDb()
    .prepare("SELECT id, email, name, role, created_at FROM users ORDER BY name COLLATE NOCASE")
    .all() as Parameters<typeof toUser>[0][];
  return ok({ users: rows.map(toUser) });
});
