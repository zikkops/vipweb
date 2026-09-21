import { localToday } from "@/lib/dues";
import { requireAdmin } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { board, reportDate } from "@/lib/server/repo";

// The browser sends its own "today" so statuses follow the admin's clock.
export const GET = handle(async (req: Request) => {
  await requireAdmin();
  return ok(board(reportDate(new URL(req.url).searchParams.get("date") ?? localToday())));
});
