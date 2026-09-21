import { requireUser } from "@/lib/server/auth";
import { handle, HttpError, ok, readJson } from "@/lib/server/http";
import { createTask, listTasks } from "@/lib/server/tasks";

// GET /api/tasks/          → my tasks
// GET /api/tasks/?all=1    → everyone's (admins)
export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all && user.role !== "admin") throw new HttpError(403, "Admins only.");
  return ok({ tasks: listTasks(all ? null : user.id) });
});

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  return ok({ task: createTask(user, await readJson(req)) }, 201);
});
