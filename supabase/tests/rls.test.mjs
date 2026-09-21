// Checks the Supabase schema's row-level security on a real Postgres engine
// (PGlite, in-process), with the pieces of Supabase Auth it relies on stubbed:
// auth.users, auth.uid() and the anon/authenticated roles.
// Run: npm run test:rls

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const MIGRATION = new URL("../migrations/20260921000000_dues.sql", import.meta.url);

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text not null, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`;

const ADMIN = "00000000-0000-0000-0000-00000000000a";
const RITA = "00000000-0000-0000-0000-00000000000b";
const KARIM = "00000000-0000-0000-0000-00000000000c";

let db;

/** Runs `sql` as a signed-in user (or anon when `uid` is null), like PostgREST does. */
async function as(uid, sql, params = []) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(`set role ${uid ? "authenticated" : "anon"}`);
  try {
    return (await db.query(sql, params)).rows;
  } finally {
    await db.exec("reset role");
  }
}

const signUp = (id, email, name) =>
  db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [id, email, { name }]);

async function addTask(uid, title) {
  const [{ id }] = await as(
    uid,
    "insert into tasks (brand_id, section_id, title, created_on) values (1, 1, $1, '2026-09-21') returning id",
    [title]
  );
  return id;
}

before(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  await db.exec(readFileSync(MIGRATION, "utf8"));
  await signUp(ADMIN, "Admin@VIPMINDS.com", "Admin");
  await signUp(RITA, "rita@vipminds.com", "Rita");
  await signUp(KARIM, "karim@vipminds.com", "Karim");
});

describe("sign-up", () => {
  it("makes the first account the admin and later ones employees", async () => {
    const rows = await db.query("select email, role from profiles order by email");
    assert.deepEqual(rows.rows, [
      { email: "admin@vipminds.com", role: "admin" },
      { email: "karim@vipminds.com", role: "employee" },
      { email: "rita@vipminds.com", role: "employee" },
    ]);
  });

  it("rejects addresses outside the company unless allow-listed", async () => {
    await assert.rejects(signUp("00000000-0000-0000-0000-0000000000ff", "someone@gmail.com", "X"), /vipminds\.com/);
    await signUp("00000000-0000-0000-0000-0000000000fe", "mark.zakkak@gmail.com", "Mark");
    await db.query("delete from auth.users where id = '00000000-0000-0000-0000-0000000000fe'");
  });
});

describe("tasks", () => {
  let ritaTask, karimTask;
  before(async () => {
    ritaTask = await addTask(RITA, "Rita's task");
    karimTask = await addTask(KARIM, "Karim's task");
  });

  it("shows people only their own tasks", async () => {
    assert.deepEqual((await as(RITA, "select title from tasks")).map((r) => r.title), ["Rita's task"]);
    assert.deepEqual((await as(KARIM, "select title from tasks")).map((r) => r.title), ["Karim's task"]);
  });

  it("shows admins everyone's tasks", async () => {
    assert.equal((await as(ADMIN, "select id from tasks")).length, 2);
  });

  it("shows signed-out visitors nothing", async () => {
    await assert.rejects(as(null, "select id from tasks"), /permission denied/);
  });

  it("stops people adding tasks for someone else", async () => {
    await assert.rejects(
      as(RITA, "insert into tasks (user_id, brand_id, section_id, title, created_on) values ($1, 1, 1, 'x', '2026-09-21')", [KARIM]),
      /row-level security/
    );
  });

  it("stops people (admins included) changing someone else's task", async () => {
    assert.equal((await as(RITA, "update tasks set title = 'hijacked' where id = $1 returning id", [karimTask])).length, 0);
    assert.equal((await as(ADMIN, "update tasks set title = 'hijacked' where id = $1 returning id", [karimTask])).length, 0);
    const [{ title }] = (await db.query("select title from tasks where id = $1", [karimTask])).rows;
    assert.equal(title, "Karim's task");
  });

  it("lets the owner block their own task, but not someone else's", async () => {
    await as(RITA, "insert into task_blocks (task_id, reason, blocked_on) values ($1, 'Images', '2026-09-21')", [ritaTask]);
    await assert.rejects(
      as(RITA, "insert into task_blocks (task_id, reason, blocked_on) values ($1, 'x', '2026-09-21')", [karimTask]),
      /row-level security/
    );
    assert.equal((await as(KARIM, "select id from task_blocks")).length, 0);
    assert.equal((await as(ADMIN, "select id from task_blocks")).length, 1);
  });

  it("keeps history append-only and in the owner's name", async () => {
    await as(RITA, "insert into task_events (task_id, type) values ($1, 'created')", [ritaTask]);
    await assert.rejects(
      as(RITA, "insert into task_events (task_id, user_id, type) values ($1, $2, 'done')", [ritaTask, KARIM]),
      /row-level security/
    );
    await assert.rejects(as(RITA, "update task_events set note = 'edited'"), /permission denied/);
    await assert.rejects(as(ADMIN, "delete from task_events"), /permission denied/);
  });
});

describe("people and tags", () => {
  it("stops employees promoting themselves", async () => {
    await assert.rejects(as(RITA, "update profiles set role = 'admin' where id = $1", [RITA]), /Only admins/);
  });

  it("lets people rename themselves but not change their email", async () => {
    await as(RITA, "update profiles set name = 'Rita H.' where id = $1", [RITA]);
    await assert.rejects(as(RITA, "update profiles set email = 'x@vipminds.com' where id = $1", [RITA]), /permission denied/);
  });

  it("lets admins manage roles but never remove the last active admin", async () => {
    await as(ADMIN, "update profiles set role = 'admin' where id = $1", [KARIM]);
    await as(ADMIN, "update profiles set role = 'employee' where id = $1", [KARIM]);
    await assert.rejects(as(ADMIN, "update profiles set active = false where id = $1", [ADMIN]), /at least one active admin/);
  });

  it("locks out deactivated accounts", async () => {
    await as(ADMIN, "update profiles set active = false where id = $1", [KARIM]);
    await assert.rejects(addTask(KARIM, "after deactivation"), /row-level security/);
    assert.equal((await as(KARIM, "select id from brands")).length, 0);
    await as(ADMIN, "update profiles set active = true where id = $1", [KARIM]);
  });

  it("lets only admins add or edit brands and sections", async () => {
    await assert.rejects(as(RITA, "insert into brands (name) values ('Rogue')"), /row-level security/);
    assert.equal((await as(RITA, "update sections set code = 'X' returning id")).length, 0);
    await as(ADMIN, "insert into brands (name, code) values ('Otonomus', 'OTO')");
    assert.ok((await as(RITA, "select name from brands")).some((b) => b.name === "Otonomus"));
  });

  it("keeps check-ins private to their owner and admins", async () => {
    await as(RITA, "insert into checkins (date, asana_matches) values ('2026-09-21', true)");
    assert.equal((await as(KARIM, "select * from checkins")).length, 0);
    assert.equal((await as(ADMIN, "select * from checkins")).length, 1);
  });
});
