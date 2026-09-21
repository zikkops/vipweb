import { localToday } from "@/lib/dues";
import { requireUser } from "@/lib/server/auth";
import { handle, ok, readJson } from "@/lib/server/http";
import { getReport, reportDate, saveReport } from "@/lib/server/repo";

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const date = reportDate(new URL(req.url).searchParams.get("date") ?? localToday());
  return ok({ report: getReport(user.id, date) });
});

export const PUT = handle(async (req: Request) => {
  const user = await requireUser();
  const body = await readJson(req);
  return ok({ report: saveReport(user.id, reportDate(body.date), body) });
});
