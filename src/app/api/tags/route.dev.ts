import { requireAdmin, requireUser } from "@/lib/server/auth";
import { handle, ok, readJson } from "@/lib/server/http";
import { createTag, listTags, tagKind } from "@/lib/server/repo";

export const GET = handle(async () => {
  await requireUser();
  return ok({ brands: listTags("brand"), sections: listTags("section") });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  return ok({ tag: createTag(tagKind(body.kind), body) }, 201);
});
