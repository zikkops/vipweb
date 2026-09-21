"use client";

// The dashboard's data layer: Supabase Auth for sign-in and Postgres (through
// Supabase's API) for data. Who may read or change what is enforced in the
// database by row-level security (supabase/migrations); the checks here only
// give friendlier messages.

import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { COMPANY_DOMAIN, isAllowedEmail, type Tag, type TagKind, type User } from "@/lib/dues";
import { jobCode } from "@/lib/jobCode";
import { needsSlipReason, type Checkin, type Task, type TaskBlock, type TaskEvent, type TaskEventType } from "@/lib/tasks";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!URL || !KEY) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.local).");
}

export const supabase = createClient(URL, KEY);

export type Tags = { brands: Tag[]; sections: Tag[] };

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong.");

/** Supabase errors as plain Errors with a readable message. */
function check<T>(result: { data: T; error: PostgrestError | null }): T {
  if (result.error) {
    const { code, message } = result.error;
    if (code === "42501") throw new Error("You don’t have permission to do that.");
    if (code === "23505") throw new Error("That name is already taken.");
    throw new Error(message);
  }
  return result.data;
}

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Please sign in.");
  return id;
}

/** Where email links (confirmation, password reset) bring people back to. */
const dashboardUrl = (path = "") => `${window.location.origin}/dashboard/${path}`;

// ---- people ------------------------------------------------------------------

type ProfileRow = { id: string; email: string; name: string; role: User["role"]; active: boolean; created_at: string };
const PROFILE_COLUMNS = "id, email, name, role, active, created_at";
const toUser = (r: ProfileRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  active: r.active,
  createdAt: r.created_at,
});

export async function currentProfile(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) return null;
  const row = check(await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle());
  return row ? toUser(row as ProfileRow) : null;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) {
    throw new Error(
      error.code === "email_not_confirmed"
        ? "Confirm your email first — check your inbox for the link."
        : error.code === "invalid_credentials"
          ? "Wrong email or password."
          : error.message
    );
  }
}

/** Returns true when the account needs its email confirmed before signing in. */
export async function signUp(name: string, email: string, password: string): Promise<boolean> {
  const address = email.trim().toLowerCase();
  if (!isAllowedEmail(address)) throw new Error(`Use your @${COMPANY_DOMAIN} email address.`);
  const { data, error } = await supabase.auth.signUp({
    email: address,
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: dashboardUrl() },
  });
  if (error) throw new Error(error.message);
  return !data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** Emails a password-reset link. Anyone can ask for their own; admins use it for others. */
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: dashboardUrl("account/") });
  if (error) throw new Error(error.message);
}

export async function changePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function listUsers(): Promise<User[]> {
  const rows = check(await supabase.from("profiles").select(PROFILE_COLUMNS).order("active", { ascending: false }).order("name"));
  return (rows as ProfileRow[]).map(toUser);
}

export async function updateUser(id: string, patch: { role?: User["role"]; active?: boolean }) {
  check(await supabase.from("profiles").update(patch).eq("id", id).select("id").single());
}

// ---- tags --------------------------------------------------------------------

const TAG_TABLE: Record<TagKind, "brands" | "sections"> = { brand: "brands", section: "sections" };

export async function listTags(): Promise<Tags> {
  const [brands, sections] = await Promise.all([
    supabase.from("brands").select("id, name, code, active").order("name"),
    supabase.from("sections").select("id, name, code, active").order("name"),
  ]);
  const byName = (a: Tag, b: Tag) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  return { brands: (check(brands) as Tag[]).sort(byName), sections: (check(sections) as Tag[]).sort(byName) };
}

function tagCode(code: string | null | undefined): string | null {
  const value = (code ?? "").trim().toUpperCase();
  if (value && !/^[A-Z0-9]{1,12}$/.test(value)) throw new Error("Codes use up to 12 letters and numbers.");
  return value || null;
}

export async function createTag(kind: TagKind, name: string, code: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Give it a name.");
  check(await supabase.from(TAG_TABLE[kind]).insert({ name: trimmed, code: tagCode(code) }).select("id").single());
}

export async function updateTag(kind: TagKind, id: number, patch: { name?: string; code?: string | null; active?: boolean }) {
  const row: Record<string, unknown> = { ...patch };
  if ("code" in patch) row.code = tagCode(patch.code);
  if ("name" in patch) row.name = patch.name!.trim();
  check(await supabase.from(TAG_TABLE[kind]).update(row).eq("id", id).select("id").single());
}

// ---- tasks -------------------------------------------------------------------

type TaskRow = {
  id: number;
  user_id: string;
  brand_id: number;
  section_id: number;
  title: string;
  due_date: string | null;
  job_code: string | null;
  created_on: string;
  done_on: string | null;
  updated_at: string;
  profiles: { name: string } | null;
  task_blocks: { id: number; reason: string; waiting_on: string; blocked_on: string; received_on: string | null }[];
};

const TASK_SELECT =
  "id, user_id, brand_id, section_id, title, due_date, job_code, created_on, done_on, updated_at, profiles(name), task_blocks(id, reason, waiting_on, blocked_on, received_on)";

function toTask(r: TaskRow): Task {
  const blocks: TaskBlock[] = r.task_blocks
    .map((b) => ({ id: b.id, reason: b.reason, waitingOn: b.waiting_on, blockedOn: b.blocked_on, receivedOn: b.received_on }))
    .sort((a, b) => a.blockedOn.localeCompare(b.blockedOn) || a.id - b.id);
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.profiles?.name ?? "—",
    brandId: r.brand_id,
    sectionId: r.section_id,
    title: r.title,
    dueDate: r.due_date,
    jobCode: r.job_code,
    createdOn: r.created_on,
    doneOn: r.done_on,
    blocks,
    updatedAt: r.updated_at,
  };
}

/** My tasks, or (admins) everyone’s. */
export async function listTasks(all: boolean): Promise<Task[]> {
  let query = supabase.from("tasks").select(TASK_SELECT).order("due_date", { ascending: true, nullsFirst: false }).order("id");
  if (!all) query = query.eq("user_id", await uid());
  return (check(await query) as unknown as TaskRow[]).map(toTask);
}

async function getTask(id: number): Promise<Task> {
  return toTask(check(await supabase.from("tasks").select(TASK_SELECT).eq("id", id).single()) as unknown as TaskRow);
}

export async function taskEvents(taskId: number): Promise<TaskEvent[]> {
  const rows = check(
    await supabase
      .from("task_events")
      .select("id, type, from_value, to_value, note, at, profiles(name)")
      .eq("task_id", taskId)
      .order("at", { ascending: false })
      .order("id", { ascending: false })
  ) as unknown as {
    id: number;
    type: TaskEventType;
    from_value: string | null;
    to_value: string | null;
    note: string;
    at: string;
    profiles: { name: string } | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    fromValue: r.from_value,
    toValue: r.to_value,
    note: r.note,
    at: r.at,
    userName: r.profiles?.name ?? "—",
  }));
}

export async function getTaskWithEvents(id: number) {
  const [task, events] = await Promise.all([getTask(id), taskEvents(id)]);
  return { task, events };
}

type EventInput = { type: TaskEventType; from?: string | null; to?: string | null; note?: string };

async function logEvents(taskId: number, events: EventInput[]) {
  if (!events.length) return;
  check(
    await supabase.from("task_events").insert(
      events.map((e) => ({ task_id: taskId, type: e.type, from_value: e.from ?? null, to_value: e.to ?? null, note: e.note ?? "" }))
    )
  );
}

const findTag = (tags: Tag[], id: number) => tags.find((t) => t.id === id);

export async function createTask(
  tags: Tags,
  input: { brandId: number; sectionId: number; title: string; dueDate: string | null; today: string }
): Promise<Task> {
  const title = input.title.trim();
  if (!title) throw new Error("Name the task.");
  const code = jobCode(findTag(tags.brands, input.brandId), findTag(tags.sections, input.sectionId), input.today).code;
  const { id } = check(
    await supabase
      .from("tasks")
      .insert({
        brand_id: input.brandId,
        section_id: input.sectionId,
        title,
        due_date: input.dueDate,
        job_code: code,
        created_on: input.today,
      })
      .select("id")
      .single()
  ) as { id: number };
  await logEvents(id, [{ type: "created", to: code }]);
  return getTask(id);
}

export async function updateTask(
  tags: Tags,
  task: Task,
  patch: { brandId: number; sectionId: number; title: string; dueDate: string | null; reason?: string },
  today: string
): Promise<Task> {
  const title = patch.title.trim();
  if (!title) throw new Error("Name the task.");
  const reason = patch.reason?.trim() ?? "";
  if (patch.dueDate !== task.dueDate && needsSlipReason(task, patch.dueDate, today) && !reason) {
    throw new Error("This task is overdue — say why the date is moving.");
  }

  // The code keeps the month the task was opened; only brand/section move it.
  const tagsMoved = patch.brandId !== task.brandId || patch.sectionId !== task.sectionId;
  const code = tagsMoved
    ? jobCode(findTag(tags.brands, patch.brandId), findTag(tags.sections, patch.sectionId), task.createdOn).code
    : task.jobCode;

  check(
    await supabase
      .from("tasks")
      .update({
        brand_id: patch.brandId,
        section_id: patch.sectionId,
        title,
        due_date: patch.dueDate,
        job_code: code,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .select("id")
      .single()
  );

  const events: EventInput[] = [];
  if (patch.dueDate !== task.dueDate) events.push({ type: "due_changed", from: task.dueDate, to: patch.dueDate, note: reason });
  if (code !== task.jobCode) events.push({ type: "job_code_changed", from: task.jobCode, to: code });
  const changed = [
    title !== task.title && "task",
    patch.brandId !== task.brandId && "brand",
    patch.sectionId !== task.sectionId && "work section",
  ].filter(Boolean);
  if (changed.length) events.push({ type: "edited", note: `Changed ${changed.join(", ")}` });
  await logEvents(task.id, events);

  return getTask(task.id);
}

export type TaskAction =
  | { action: "done" }
  | { action: "reopen" }
  | { action: "block"; reason: string; waitingOn: string; blockedOn: string }
  | { action: "receive" };

export async function taskAction(task: Task, act: TaskAction, today: string): Promise<Task> {
  const touch = { updated_at: new Date().toISOString() };
  const openBlock = task.blocks.find((b) => b.receivedOn === null);

  switch (act.action) {
    case "done":
      if (task.doneOn) throw new Error("This task is already done.");
      check(await supabase.from("tasks").update({ done_on: today, ...touch }).eq("id", task.id).select("id").single());
      await logEvents(task.id, [{ type: "done" }]);
      break;

    case "reopen":
      if (!task.doneOn) throw new Error("This task isn’t done.");
      check(await supabase.from("tasks").update({ done_on: null, ...touch }).eq("id", task.id).select("id").single());
      await logEvents(task.id, [{ type: "reopened" }]);
      break;

    case "block": {
      if (task.doneOn) throw new Error("A finished task can’t be blocked.");
      if (openBlock) throw new Error("This task is already blocked.");
      const reason = act.reason.trim();
      if (!reason) throw new Error("Say why it’s blocked.");
      if (act.blockedOn > today) throw new Error("The blocked date can’t be in the future.");
      check(
        await supabase
          .from("task_blocks")
          .insert({ task_id: task.id, reason, waiting_on: act.waitingOn.trim(), blocked_on: act.blockedOn })
          .select("id")
          .single()
      );
      check(await supabase.from("tasks").update(touch).eq("id", task.id).select("id").single());
      await logEvents(task.id, [{ type: "blocked", from: act.blockedOn, to: act.waitingOn.trim() || null, note: reason }]);
      break;
    }

    case "receive":
      if (!openBlock) throw new Error("This task isn’t blocked.");
      check(await supabase.from("task_blocks").update({ received_on: today }).eq("id", openBlock.id).select("id").single());
      check(await supabase.from("tasks").update(touch).eq("id", task.id).select("id").single());
      await logEvents(task.id, [{ type: "received", to: openBlock.waitingOn || null, note: openBlock.reason }]);
      break;
  }

  return getTask(task.id);
}

// ---- daily check-in ----------------------------------------------------------

type CheckinRow = { user_id: string; date: string; asana_matches: boolean; asana_fix_note: string; updated_at: string };
const toCheckin = (r: CheckinRow): Checkin => ({
  date: r.date,
  asanaMatches: r.asana_matches,
  asanaFixNote: r.asana_fix_note,
  updatedAt: r.updated_at,
});

export async function getCheckin(date: string): Promise<Checkin | null> {
  const row = check(
    await supabase.from("checkins").select("user_id, date, asana_matches, asana_fix_note, updated_at").eq("user_id", await uid()).eq("date", date).maybeSingle()
  );
  return row ? toCheckin(row as CheckinRow) : null;
}

export async function saveCheckin(date: string, asanaMatches: boolean, fixNote: string): Promise<Checkin> {
  const note = asanaMatches ? "" : fixNote.trim();
  if (!asanaMatches && !note) throw new Error("Say what you fixed.");
  const row = check(
    await supabase
      .from("checkins")
      .upsert(
        { user_id: await uid(), date, asana_matches: asanaMatches, asana_fix_note: note, updated_at: new Date().toISOString() },
        { onConflict: "user_id,date" }
      )
      .select("user_id, date, asana_matches, asana_fix_note, updated_at")
      .single()
  );
  return toCheckin(row as CheckinRow);
}

/** Every active person with their check-in for `date` (admins). */
export async function checkinsFor(date: string) {
  const [people, checkins] = await Promise.all([
    supabase.from("profiles").select("id, name").eq("active", true).order("name"),
    supabase.from("checkins").select("user_id, date, asana_matches, asana_fix_note, updated_at").eq("date", date),
  ]);
  const byUser = new Map((check(checkins) as CheckinRow[]).map((c) => [c.user_id, toCheckin(c)]));
  return (check(people) as { id: string; name: string }[]).map((p) => ({
    userId: p.id,
    name: p.name,
    checkin: byUser.get(p.id) ?? null,
  }));
}
