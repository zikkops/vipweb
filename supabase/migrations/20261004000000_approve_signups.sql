-- New accounts wait for an admin to approve them, instead of confirming their
-- email. Until approved, an account gets nothing: is_active() is false, so
-- every row-level security policy refuses it. The very first account (the
-- admin) and everyone who already has an account are approved.
-- Pair with Supabase → Authentication → Sign In / Providers → Email:
-- "Confirm email" off. Test with: npm run test:rls

alter table public.profiles add column approved boolean not null default false;
update public.profiles set approved = true;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active and approved);
$$;

create or replace function public.is_active() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and active and approved);
$$;

-- Same as before, plus: the first account is approved, everyone else waits.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  addr text := lower(new.email);
  first boolean := not exists (select 1 from profiles);
begin
  if addr not like '%@vipminds.com' and not exists (select 1 from allowed_emails where email = addr) then
    raise exception 'Use your @vipminds.com email address.' using errcode = 'check_violation';
  end if;
  insert into profiles (id, email, name, role, approved)
  values (
    new.id,
    addr,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(addr, '@', 1)),
    case when first then 'admin' else 'employee' end,
    first
  );
  return new;
end;
$$;

-- Only admins approve, and nobody approves themselves.
grant update (approved) on public.profiles to authenticated;

create or replace function public.guard_own_profile() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() and (
    new.role is distinct from old.role or new.active is distinct from old.active or new.approved is distinct from old.approved
  ) then
    raise exception 'Only admins can change roles, approve or deactivate accounts.' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;
