import { currentUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";

export const GET = handle(async () => ok({ user: await currentUser() }));
