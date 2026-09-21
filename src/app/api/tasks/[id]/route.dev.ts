import { requireUser } from "@/lib/server/auth";
import { handle, intId, ok, readJson } from "@/lib/server/http";
import { readableTask, taskAction, taskEvents, updateTask } from "@/lib/server/tasks";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const task = readableTask(user, intId((await params).id, "Task id"));
  return ok({ task, events: taskEvents(task.id) });
});

// Edit brand, section, title or due date.
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  return ok({ task: updateTask(user, intId((await params).id, "Task id"), await readJson(req)) });
});

// { action: "done" | "reopen" | "block" | "receive", ... }
export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  return ok({ task: taskAction(user, intId((await params).id, "Task id"), await readJson(req)) });
});
