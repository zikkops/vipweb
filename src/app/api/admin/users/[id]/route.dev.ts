import { requireAdmin, toUser } from "@/lib/server/auth";
import { transaction } from "@/lib/server/db";
import { handle, HttpError, intId, ok, readJson } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const id = intId((await params).id, "User id");
  const { role } = await readJson(req);
  if (role !== "admin" && role !== "employee") throw new HttpError(400, "Role must be admin or employee.");

  const user = transaction((db) => {
    const existing = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as { role: string } | undefined;
    if (!existing) throw new HttpError(404, "User not found.");
    if (existing.role === "admin" && role === "employee") {
      const { n } = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get() as { n: number };
      if (n <= 1) throw new HttpError(400, "There must be at least one admin.");
    }
    return db
      .prepare("UPDATE users SET role = ? WHERE id = ? RETURNING id, email, name, role, created_at")
      .get(role, id) as Parameters<typeof toUser>[0];
  });

  return ok({ user: toUser(user) });
});
