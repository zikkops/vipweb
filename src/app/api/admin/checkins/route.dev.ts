import { requireAdmin } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { checkinsFor, today, parseDay } from "@/lib/server/tasks";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const date = parseDay(new URL(req.url).searchParams.get("date") ?? today(undefined), "Date");
  return ok({ date, people: checkinsFor(date) });
});
