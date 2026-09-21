import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { reportHistory } from "@/lib/server/repo";

export const GET = handle(async () => {
  const user = await requireUser();
  return ok({ reports: reportHistory(user.id) });
});
