import { requireAdmin } from "@/lib/server/auth";
import { handle, intId, ok, readJson } from "@/lib/server/http";
import { tagKind, updateTag } from "@/lib/server/repo";

type Ctx = { params: Promise<{ kind: string; id: string }> };

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { kind, id } = await params;
  return ok({ tag: updateTag(tagKind(kind), intId(id, "Tag id"), await readJson(req)) });
});
