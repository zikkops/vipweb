import { requireUser } from "@/lib/server/auth";
import { handle, ok, readJson } from "@/lib/server/http";
import { getCheckin, saveCheckin, today, parseDay } from "@/lib/server/tasks";

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const date = parseDay(new URL(req.url).searchParams.get("date") ?? today(undefined), "Date");
  return ok({ checkin: getCheckin(user.id, date) });
});

export const PUT = handle(async (req: Request) => {
  const user = await requireUser();
  return ok({ checkin: saveCheckin(user.id, await readJson(req)) });
});
