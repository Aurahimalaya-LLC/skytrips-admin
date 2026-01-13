create table if not exists public.agencies (
  uid uuid primary key default gen_random_uuid(),
  agency_name text not null check (char_length(agency_name) <= 100),
  contact_person text not null check (char_length(contact_person) <= 50),
  number text not null,
  contact_email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  iata_code text check (char_length(iata_code) <= 8),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  draft boolean default false,
  deleted_at timestamptz
);

-- Booking associations removed: ensure table is absent
drop table if exists public.agency_booking_refs;

create or replace function public.agencies_set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'agencies_set_updated_at') then
    create trigger agencies_set_updated_at before update on public.agencies
    for each row execute function public.agencies_set_updated_at();
  end if;
end $$;

alter table public.agencies enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'agencies_read_all' and tablename = 'agencies') then
    create policy agencies_read_all on public.agencies for select using (true);
  end if;
end $$;


-- Versioning
create table if not exists public.agencies_versions (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.agencies_version_snapshot() returns trigger as $$
begin
  insert into public.agencies_versions(agency_uid, snapshot)
  values (old.uid, to_jsonb(old));
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'agencies_version_on_update') then
    create trigger agencies_version_on_update after update on public.agencies
    for each row execute function public.agencies_version_snapshot();
  end if;
end $$;
