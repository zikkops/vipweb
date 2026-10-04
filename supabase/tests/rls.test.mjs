// Checks the Supabase schema's row-level security on a real Postgres engine
// (PGlite, in-process), with the pieces of Supabase Auth it relies on stubbed:
// auth.users, auth.uid() and the anon/authenticated roles.
// Run: npm run test:rls

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = ["20260921000000_dues.sql", "20260923000000_job_codes.sql", "20261004000000_approve_signups.sql"].map(
  (name) => new URL(`../migrations/${name}`, import.meta.url)
);

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
  for (const migration of MIGRATIONS) await db.exec(readFileSync(migration, "utf8"));
  await signUp(ADMIN, "Admin@VIPMINDS.com", "Admin");
  await signUp(RITA, "rita@vipminds.com", "Rita");
  await signUp(KARIM, "karim@vipminds.com", "Karim");
  // New accounts wait for approval; the rest of the suite works with approved ones.
  await as(ADMIN, "update profiles set approved = true where id in ($1, $2)", [RITA, KARIM]);
});

describe("approval", () => {
  const NEWBIE = "00000000-0000-0000-0000-00000000000d";
  before(() => signUp(NEWBIE, "newbie@vipminds.com", "Newbie"));

  it("approves the first account and makes everyone after it wait", async () => {
    const rows = (await db.query("select email, approved from profiles where email in ('admin@vipminds.com', 'newbie@vipminds.com') order by email")).rows;
    assert.deepEqual(rows, [
      { email: "admin@vipminds.com", approved: true },
      { email: "newbie@vipminds.com", approved: false },
    ]);
  });

  it("gives a waiting account nothing, and doesn't let it approve itself", async () => {
    assert.equal((await as(NEWBIE, "select id from brands")).length, 0);
    await assert.rejects(addTask(NEWBIE, "too early"), /row-level security/);
    assert.equal((await as(NEWBIE, "update profiles set approved = true where id = $1 returning id", [NEWBIE])).length, 0);
    assert.equal((await as(RITA, "update profiles set approved = true where id = $1 returning id", [NEWBIE])).length, 0);
    await assert.rejects(as(RITA, "update profiles set approved = false where id = $1", [RITA]), /Only admins/);
    const [{ approved }] = (await db.query("select approved from profiles where id = $1", [NEWBIE])).rows;
    assert.equal(approved, false);
  });

  it("lets an admin approve an account, which then works", async () => {
    await as(ADMIN, "update profiles set approved = true where id = $1", [NEWBIE]);
    assert.ok((await as(NEWBIE, "select id from brands")).length > 0);
    await db.query("delete from auth.users where id = $1", [NEWBIE]);
  });
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

describe("job codes", () => {
  let bdf, soc, crv, month;
  const insert = (uid, title, code, section = soc) =>
    as(
      uid,
      "insert into tasks (brand_id, section_id, title, created_on, job_code) values ($1, $2, $3, '2026-09-21', $4) returning id",
      [bdf, section, title, code]
    );

  before(async () => {
    [{ id: bdf }] = (await db.query("select id from brands where code = 'BDF'")).rows;
    [{ id: soc }] = (await db.query("select id from sections where code = 'SOC'")).rows;
    [{ id: crv }] = (await db.query("select id from sections where code = 'CRV'")).rows;
    [{ month }] = (await db.query("select to_char(now() at time zone 'Asia/Beirut', 'MMYY') as month")).rows;
  });

  it("turns work sections into the spec's types, and lets admins add more with 3 letter codes", async () => {
    const rows = (await db.query("select code, name from sections where active order by code")).rows;
    assert.equal(rows.length, 11);
    assert.deepEqual(rows.find((r) => r.code === "CRV"), { code: "CRV", name: "Creative, design, artwork" });
    await assert.rejects(as(ADMIN, "insert into sections (name, code) values ('Design', 'DESIGN')"), /sections_code_check/);
    await assert.rejects(as(ADMIN, "insert into sections (name, code) values ('Social 2', 'SOC')"), /sections_code_key/);
    await assert.rejects(as(RITA, "insert into sections (name, code) values ('Training', 'TRN')"), /row-level security/);
    await as(ADMIN, "insert into sections (name, code) values ('Training', 'TRN')");
  });

  it("seeds the spec's clients and keeps client codes to 2 or 3 letters", async () => {
    const codes = (await db.query("select code from brands where code is not null")).rows.map((r) => r.code);
    for (const code of ["BDF", "PAC", "WB", "CAN", "DAN", "NAT", "GEM", "EVC", "VIP"]) assert.ok(codes.includes(code), code);
    await assert.rejects(as(ADMIN, "insert into brands (name, code) values ('Candia Old', 'CANDIA')"), /brands_code_check/);
    await assert.rejects(as(ADMIN, "insert into brands (name, code) values ('Beirut Duty Free 2', 'BDF')"), /brands_code_key/);
  });

  it("lets a client or type get a code once, then keeps it", async () => {
    const [{ id }] = await as(ADMIN, "insert into brands (name) values ('Uncoded Client') returning id");
    await as(ADMIN, "update brands set code = 'UC' where id = $1", [id]);
    await assert.rejects(as(ADMIN, "update brands set code = 'UCL' where id = $1", [id]), /never changes/);
    await assert.rejects(as(ADMIN, "update sections set code = 'XYZ' where code = 'SOC'"), /never changes/);
    await as(ADMIN, "update sections set name = 'Social and content' where code = 'SOC'");
  });

  it("accepts a code that matches its client, type and month", async () => {
    await insert(RITA, "September promotions", `BDF-${month}-SOC-SeptemberPromotions`);
    const [{ id: trn }] = (await db.query("select id from sections where code = 'TRN'")).rows;
    await insert(RITA, "Staff training", `BDF-${month}-TRN-StaffTraining`, trn);
  });

  it("rejects codes in the wrong format or for a different client, type or month", async () => {
    await assert.rejects(insert(RITA, "x", `BDF-${month}-SOC-september promo`), /tasks_job_code_format/);
    await assert.rejects(insert(RITA, "x", `BDF-${month}-CRV-Promo`), new RegExp(`must start with BDF-${month}-SOC-`));
    await assert.rejects(insert(RITA, "x", "BDF-0125-SOC-Promo"), /must start with/);
  });

  it("blocks an identical code, whoever owns it and whatever its case", async () => {
    await assert.rejects(insert(KARIM, "x", `BDF-${month}-SOC-SeptemberPromotions`), /tasks_job_code_key/);
    await assert.rejects(insert(KARIM, "x", `BDF-${month}-SOC-SEPTEMBERPROMOTIONS`), /tasks_job_code_key/);
  });

  it("never changes a code once set, but lets a task without one get it later", async () => {
    const [{ id }] = await insert(KARIM, "Story reels", null, crv);
    await as(KARIM, "update tasks set job_code = $2 where id = $1", [id, `BDF-${month}-CRV-StoryReels`]);
    await assert.rejects(
      as(KARIM, "update tasks set job_code = $2 where id = $1", [id, `BDF-${month}-CRV-Reels`]),
      /never changes/
    );
    await assert.rejects(as(KARIM, "update tasks set job_code = null where id = $1", [id]), /never changes/);
    await as(KARIM, "update tasks set title = 'Renamed', section_id = $2 where id = $1", [id, soc]);
  });

  it("allows sub-jobs one level under an existing job only", async () => {
    await insert(KARIM, "TVC", `BDF-${month}-SOC-SeptemberPromotions-TVC`);
    await assert.rejects(insert(KARIM, "x", `BDF-${month}-SOC-NoSuchJob-TVC`), /no job/);
    await assert.rejects(insert(KARIM, "x", `BDF-${month}-SOC-SeptemberPromotions-TVC-Cut`), /tasks_job_code_format/);
  });

  it("keeps a task's description apart from its code", async () => {
    const [{ id }] = await insert(RITA, "Launch post", `BDF-${month}-SOC-LaunchPost`);
    await as(RITA, "update tasks set description = 'Two posts, use the new photos' where id = $1", [id]);
    const [row] = (await db.query("select description, job_code from tasks where id = $1", [id])).rows;
    assert.deepEqual(row, { description: "Two posts, use the new photos", job_code: `BDF-${month}-SOC-LaunchPost` });
    await assert.rejects(as(RITA, "update tasks set description = $2 where id = $1", [id, "x".repeat(2001)]), /check/);
  });

  it("lists every code to signed-in people, and nothing to visitors", async () => {
    const codes = (await as(RITA, "select code from job_codes()")).map((r) => r.code);
    assert.ok(codes.includes(`BDF-${month}-CRV-StoryReels`), "includes Karim's code");
    await assert.rejects(as(null, "select code from job_codes()"), /permission denied/);
  });
});
