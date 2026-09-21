-- Daily-dues dashboard schema for Supabase (Postgres).
--
-- Mirrors the local SQLite version (src/lib/server/db.ts, schema v5) with
-- Supabase Auth in place of the local users/sessions tables. Every table has
-- row-level security: employees see and change only their own work, admins
-- read everything and manage people and tags. Test with: npm run test:rls

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  email                text not null unique,
  name                 text not null check (length(name) between 1 and 80),
  role                 text not null default 'employee' check (role in ('employee', 'admin')),
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

-- Addresses outside the company domain that may still sign up
-- (keep in step with EXTRA_ALLOWED_EMAILS in src/lib/dues.ts).
create table public.allowed_emails (
  email text primary key check (email = lower(email))
);
insert into public.allowed_emails (email) values ('mark.zakkak@gmail.com');

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active);
$$;

create function public.is_active() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and active);
$$;

-- New Supabase Auth users get a profile. Only company addresses (or the
-- allow-list) may sign up; the very first account becomes the admin.
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  addr text := lower(new.email);
begin
  if addr not like '%@vipminds.com' and not exists (select 1 from allowed_emails where email = addr) then
    raise exception 'Use your @vipminds.com email address.' using errcode = 'check_violation';
  end if;
  insert into profiles (id, email, name, role)
  values (
    new.id,
    addr,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(addr, '@', 1)),
    case when exists (select 1 from profiles) then 'employee' else 'admin' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admins can't demote or deactivate the last active admin.
create function public.keep_an_admin() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  if old.role = 'admin' and old.active and (new.role <> 'admin' or not new.active)
     and not exists (select 1 from profiles where role = 'admin' and active and id <> old.id) then
    raise exception 'There must be at least one active admin.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger profiles_keep_an_admin
  before update on public.profiles
  for each row execute function public.keep_an_admin();

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------

create table public.brands (
  id         bigint generated always as identity primary key,
  name       text not null check (length(name) between 1 and 80),
  code       text check (code ~ '^[A-Z0-9]{1,12}$'),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index brands_name_key on public.brands (lower(name));

create table public.sections (
  id         bigint generated always as identity primary key,
  name       text not null check (length(name) between 1 and 80),
  code       text check (code ~ '^[A-Z0-9]{1,12}$'),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index sections_name_key on public.sections (lower(name));

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------

-- Dates that decide status (created_on, due_date, done_on, blocked_on,
-- received_on) are the person's local calendar dates.
create table public.tasks (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  brand_id   bigint not null references public.brands (id),
  section_id bigint not null references public.sections (id),
  title      text not null check (length(title) between 1 and 300),
  due_date   date,
  job_code   text,
  created_on date not null,
  done_on    date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_idx on public.tasks (user_id);
create index tasks_due_idx on public.tasks (due_date);

create table public.task_blocks (
  id          bigint generated always as identity primary key,
  task_id     bigint not null references public.tasks (id) on delete cascade,
  reason      text not null check (length(reason) between 1 and 1000),
  waiting_on  text not null default '' check (length(waiting_on) <= 200),
  blocked_on  date not null,
  received_on date,
  created_at  timestamptz not null default now()
);
create index task_blocks_task_idx on public.task_blocks (task_id);

create table public.task_events (
  id         bigint generated always as identity primary key,
  task_id    bigint not null references public.tasks (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type       text not null check (type in
               ('created', 'edited', 'due_changed', 'job_code_changed', 'blocked', 'received', 'done', 'reopened')),
  from_value text,
  to_value   text,
  note       text not null default '',
  at         timestamptz not null default now()
);
create index task_events_task_idx on public.task_events (task_id);

create table public.checkins (
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  date           date not null,
  asana_matches  boolean not null,
  asana_fix_note text not null default '',
  updated_at     timestamptz not null default now(),
  primary key (user_id, date)
);

-- A task is "mine" if I own it and my account is active.
create function public.owns_task(task bigint) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from tasks t join profiles p on p.id = t.user_id
                 where t.id = task and t.user_id = auth.uid() and p.active);
$$;

create function public.can_read_task(task bigint) returns boolean
  language sql stable security definer set search_path = public
as $$
  select public.is_admin() or exists (select 1 from tasks where id = task and user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.allowed_emails enable row level security;
alter table public.brands enable row level security;
alter table public.sections enable row level security;
alter table public.tasks enable row level security;
alter table public.task_blocks enable row level security;
alter table public.task_events enable row level security;
alter table public.checkins enable row level security;

-- Nobody signed out gets anything.
revoke all on all tables in schema public from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.brands, public.sections, public.tasks, public.task_blocks, public.checkins
  to authenticated;
grant select, insert on public.task_events to authenticated;
grant select, insert, delete on public.allowed_emails to authenticated;

-- profiles: see yourself (admins see everyone); only admins change role/active.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: admins update" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- People may rename themselves, but not change their own role, status or email.
revoke update on public.profiles from authenticated;
grant update (name, role, active) on public.profiles to authenticated;
create policy "profiles: rename self" on public.profiles
  for update to authenticated
  using (id = auth.uid() and public.is_active())
  with check (id = auth.uid());
create function public.guard_own_profile() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.active is distinct from old.active) then
    raise exception 'Only admins can change roles or deactivate accounts.' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_own before update on public.profiles
  for each row execute function public.guard_own_profile();

-- allowed_emails: admins only.
create policy "allowed_emails: admins" on public.allowed_emails
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- tags: every active person reads them; admins add and edit.
create policy "brands: read" on public.brands for select to authenticated using (public.is_active());
create policy "brands: admins add" on public.brands for insert to authenticated with check (public.is_admin());
create policy "brands: admins edit" on public.brands for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "sections: read" on public.sections for select to authenticated using (public.is_active());
create policy "sections: admins add" on public.sections for insert to authenticated with check (public.is_admin());
create policy "sections: admins edit" on public.sections for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- tasks: your own (admins read all); only the owner changes a task.
create policy "tasks: read own or admin" on public.tasks
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "tasks: add own" on public.tasks
  for insert to authenticated with check (user_id = auth.uid() and public.is_active());
create policy "tasks: edit own" on public.tasks
  for update to authenticated
  using (user_id = auth.uid() and public.is_active())
  with check (user_id = auth.uid());

-- blocks follow their task.
create policy "task_blocks: read" on public.task_blocks
  for select to authenticated using (public.can_read_task(task_id));
create policy "task_blocks: add on own task" on public.task_blocks
  for insert to authenticated with check (public.owns_task(task_id));
create policy "task_blocks: edit on own task" on public.task_blocks
  for update to authenticated using (public.owns_task(task_id)) with check (public.owns_task(task_id));

-- history is append-only, written by the task's owner as themselves.
create policy "task_events: read" on public.task_events
  for select to authenticated using (public.can_read_task(task_id));
create policy "task_events: append on own task" on public.task_events
  for insert to authenticated with check (user_id = auth.uid() and public.owns_task(task_id));

-- check-ins: your own (admins read all).
create policy "checkins: read own or admin" on public.checkins
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "checkins: add own" on public.checkins
  for insert to authenticated with check (user_id = auth.uid() and public.is_active());
create policy "checkins: edit own" on public.checkins
  for update to authenticated using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Starting tags (codes only where existing job codes make them certain)
-- ---------------------------------------------------------------------------

insert into public.sections (name, code) values
  ('Website', 'WEB'), ('Branding', 'CRV'), ('Event Kit', 'EVENT'), ('Design', null), ('Social Media', null), ('App', null);
insert into public.brands (name, code) values ('Eventcom', 'EVC'), ('Naturea', 'NTR'), ('Beirut Duty Free', 'BDF');
