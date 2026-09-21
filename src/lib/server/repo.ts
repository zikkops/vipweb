import type { Tag, TagKind } from "@/lib/dues";
import { getDb } from "@/lib/server/db";
import { HttpError, str } from "@/lib/server/http";

// ---- tags ----------------------------------------------------------------

const TABLE: Record<TagKind, "brands" | "sections"> = { brand: "brands", section: "sections" };

export function tagKind(value: unknown): TagKind {
  if (value === "brand" || value === "section") return value;
  throw new HttpError(400, "Tag kind must be brand or section.");
}

type TagRow = { id: number; name: string; code: string | null; active: number };
const toTag = (r: TagRow): Tag => ({ id: r.id, name: r.name, code: r.code, active: r.active === 1 });

export function listTags(kind: TagKind): Tag[] {
  const rows = getDb()
    .prepare(`SELECT id, name, code, active FROM ${TABLE[kind]} ORDER BY name COLLATE NOCASE`)
    .all() as TagRow[];
  return rows.map(toTag);
}

function tagCode(value: unknown): string | null {
  const code = str(value, "Code", { max: 12, required: false }).toUpperCase();
  if (code && !/^[A-Z0-9]+$/.test(code)) throw new HttpError(400, "Code can only use letters and numbers.");
  return code || null;
}

function uniqueViolation(err: unknown) {
  return err instanceof Error && /UNIQUE constraint failed/.test(err.message);
}

export function createTag(kind: TagKind, body: Record<string, unknown>): Tag {
  const name = str(body.name, "Name", { max: 80 });
  const code = tagCode(body.code);
  try {
    const row = getDb()
      .prepare(`INSERT INTO ${TABLE[kind]} (name, code) VALUES (?, ?) RETURNING id, name, code, active`)
      .get(name, code) as TagRow;
    return toTag(row);
  } catch (err) {
    if (uniqueViolation(err)) throw new HttpError(409, `“${name}” already exists.`);
    throw err;
  }
}

export function updateTag(kind: TagKind, id: number, body: Record<string, unknown>): Tag {
  const db = getDb();
  const existing = db
    .prepare(`SELECT id, name, code, active FROM ${TABLE[kind]} WHERE id = ?`)
    .get(id) as TagRow | undefined;
  if (!existing) throw new HttpError(404, "Tag not found.");

  const name = "name" in body ? str(body.name, "Name", { max: 80 }) : existing.name;
  const code = "code" in body ? tagCode(body.code) : existing.code;
  const active = "active" in body ? (body.active ? 1 : 0) : existing.active;

  try {
    const row = db
      .prepare(
        `UPDATE ${TABLE[kind]} SET name = ?, code = ?, active = ? WHERE id = ?
         RETURNING id, name, code, active`
      )
      .get(name, code, active, id) as TagRow;
    return toTag(row);
  } catch (err) {
    if (uniqueViolation(err)) throw new HttpError(409, `“${name}” already exists.`);
    throw err;
  }
}
