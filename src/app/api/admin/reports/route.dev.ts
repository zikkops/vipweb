import { localToday } from "@/lib/dues";
import { requireAdmin } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { reportDate, reportsForDate } from "@/lib/server/repo";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const date = reportDate(new URL(req.url).searchParams.get("date") ?? localToday());
  return ok({ date, entries: reportsForDate(date) });
});
