import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { previousReport, reportDate } from "@/lib/server/repo";

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const before = reportDate(new URL(req.url).searchParams.get("before"));
  return ok({ report: previousReport(user.id, before) });
});
