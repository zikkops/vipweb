-- Job codes per "VIPMINDS Job Code Spec for IT" (Sep 2026):
--
--   CLIENT-MMYY-TYPE-Description[-SubJob]
--
-- Clients (2–3 letter codes) and types of work (3 letter codes, replacing work
-- sections, seeded with the spec's list) are admin-edited tables. A job code
-- is unique, matches the task it is on when set, and never changes afterwards.
-- The app builds codes with src/lib/jobCode.ts; keep the two in step.
-- Test with: npm run test:rls

-- ---------------------------------------------------------------------------
-- Clients: one 2–3 letter code each
-- ---------------------------------------------------------------------------

alter table public.brands drop constraint brands_code_check;
update public.brands set code = null where code !~ '^[A-Z]{2,3}$';
alter table public.brands add constraint brands_code_check check (code ~ '^[A-Z]{2,3}$');
create unique index brands_code_key on public.brands (code);

create temp table spec_clients (name text, code text);
insert into spec_clients values
  ('Beirut Duty Free', 'BDF'),
  ('PAC', 'PAC'),
  ('Wooden Bakery', 'WB'),
  ('Candia', 'CAN'),
  ('Dr. Dan Shaer', 'DAN'),
  ('Natalya Berikhzan', 'NAT'),
  ('GEMS', 'GEM'),
  ('Eventcom', 'EVC'),
  ('VIPMINDS internal', 'VIP');

update public.brands b set code = s.code
  from spec_clients s
  where lower(b.name) = lower(s.name) and b.code is null
    and not exists (select 1 from public.brands where code = s.code);
insert into public.brands (name, code)
  select s.name, s.code from spec_clients s
  where not exists (select 1 from public.brands where lower(name) = lower(s.name))
    and not exists (select 1 from public.brands where code = s.code);
drop table spec_clients;

-- ---------------------------------------------------------------------------
-- Types of work: the spec's list, replacing work sections
-- ---------------------------------------------------------------------------

create temp table job_types (code text primary key, name text not null);
insert into job_types values
  ('STR', 'Strategy, planning, scope'),
  ('CRV', 'Creative, design, artwork'),
  ('ADV', 'Campaign and advertising'),
  ('PRD', 'Production: film, photo, print'),
  ('SOC', 'Social media and content'),
  ('DMR', 'Digital marketing, SEM, SEO'),
  ('WEB', 'Web and app build'),
  ('PRS', 'PR and press'),
  ('EVT', 'Events and activations'),
  ('RPT', 'Reporting'),
  ('ADM', 'Admin, access, contracts');

-- Which type each existing section becomes: by its old name, else by a code
-- that is already a type code. Anything else is archived.
create temp table section_types (section_id bigint primary key, code text);
insert into section_types
  select s.id, coalesce(m.code, t.code)
  from public.sections s
  left join (values
    ('website', 'WEB'), ('app', 'WEB'), ('branding', 'CRV'), ('design', 'CRV'),
    ('event kit', 'EVT'), ('social media', 'SOC')
  ) m (name, code) on m.name = lower(s.name)
  left join job_types t on t.code = s.code;

create temp table type_keep as
  select code, min(section_id) as section_id from section_types where code is not null group by code;

-- Sections landing on the same type merge into one; their tasks move with them.
update public.tasks t set section_id = k.section_id
  from section_types st join type_keep k using (code)
  where t.section_id = st.section_id and st.section_id <> k.section_id;
delete from public.sections s
  using section_types st join type_keep k using (code)
  where s.id = st.section_id and st.section_id <> k.section_id;

alter table public.sections drop constraint sections_code_check;
update public.sections set code = null, active = false
  where id in (select section_id from section_types where code is null);
update public.sections s set name = t.name, code = t.code, active = true
  from type_keep k join job_types t using (code)
  where s.id = k.section_id;
insert into public.sections (name, code)
  select t.name, t.code from job_types t
  where not exists (select 1 from public.sections where code = t.code);

alter table public.sections add constraint sections_code_check check (code ~ '^[A-Z]{3}$');
create unique index sections_code_key on public.sections (code);
drop table job_types, section_types, type_keep;

-- ---------------------------------------------------------------------------
-- Task codes
-- ---------------------------------------------------------------------------

-- Codes made under the old rule don't fit the spec (section 6: convert before
-- going live). Clear them; each owner sets the new code from the task's Edit.
update public.tasks set job_code = null
  where job_code !~ '^[A-Z]{2,3}-(0[1-9]|1[0-2])[0-9]{2}-[A-Z]{3}-[A-Z][A-Za-z0-9]{1,39}(-[A-Z][A-Za-z0-9]{1,29})?$';

alter table public.tasks add constraint tasks_job_code_format check (
  job_code ~ '^[A-Z]{2,3}-(0[1-9]|1[0-2])[0-9]{2}-[A-Z]{3}-[A-Z][A-Za-z0-9]{1,39}(-[A-Z][A-Za-z0-9]{1,29})?$'
);

-- No running number: an identical code is blocked. Case-insensitive, because
-- the code also names files and folders.
create unique index tasks_job_code_key on public.tasks (lower(job_code));

-- A new code must belong to its task: its client's and type's codes and the
-- Beirut month the task was opened, or for a sub-job an existing parent job.
-- Once set it never changes, even if the task is renamed, moved or re-dated.
create function public.check_job_code() returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  parent text := substring(new.job_code from '^([^-]+-[^-]+-[^-]+-[^-]+)-');
  expected text;
begin
  if tg_op = 'UPDATE' then
    if new.job_code is not distinct from old.job_code then return new; end if;
    if old.job_code is not null then
      raise exception 'A job code never changes once it is set.' using errcode = 'check_violation';
    end if;
  end if;
  if new.job_code is null then return new; end if;

  if parent is not null then
    if not exists (select 1 from tasks where lower(job_code) = lower(parent)) then
      raise exception 'There is no job % to add a sub-job to.', parent using errcode = 'check_violation';
    end if;
  else
    select b.code || '-' || to_char(new.created_at at time zone 'Asia/Beirut', 'MMYY') || '-' || s.code || '-'
      into expected
      from brands b, sections s
      where b.id = new.brand_id and s.id = new.section_id;
    if expected is null or left(new.job_code, length(expected)) <> expected then
      raise exception 'The job code must start with %.', coalesce(expected, 'the client’s and type’s codes')
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger tasks_check_job_code
  before insert or update of job_code on public.tasks
  for each row execute function public.check_job_code();

-- Every code in use, so people can pick a parent for a sub-job and see a clash
-- before saving. Codes only: whose task it is stays private.
create function public.job_codes() returns table (code text, brand_id bigint, section_id bigint)
  language sql stable security definer set search_path = public
as $$
  select job_code, brand_id, section_id from tasks where job_code is not null and public.is_active() order by job_code;
$$;
revoke execute on function public.job_codes() from public, anon;
grant execute on function public.job_codes() to authenticated;

-- ---------------------------------------------------------------------------
-- Client and type codes are generated from the name once and then kept
-- ---------------------------------------------------------------------------

create function public.keep_tag_code() returns trigger
  language plpgsql
as $$
begin
  if old.code is not null and new.code is distinct from old.code then
    raise exception 'A code never changes once it is set.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger brands_keep_code before update of code on public.brands
  for each row execute function public.keep_tag_code();
create trigger sections_keep_code before update of code on public.sections
  for each row execute function public.keep_tag_code();

-- ---------------------------------------------------------------------------
-- Task description: free text that clarifies the task. Never part of the code.
-- ---------------------------------------------------------------------------

alter table public.tasks add column description text not null default ''
  check (length(description) <= 2000);
