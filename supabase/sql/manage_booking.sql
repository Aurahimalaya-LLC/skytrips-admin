-- Table
create table if not exists public.manage_booking (
  uid text primary key,
  booking_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.manage_booking add column if not exists user_id uuid;

-- Triggers
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'manage_booking_set_updated_at'
  ) then
    create trigger manage_booking_set_updated_at
    before update on public.manage_booking
    for each row execute function public.set_updated_at();
  end if;
end $$;

create or replace function public.prevent_uid_change() returns trigger as $$
begin
  if new.uid <> old.uid then
    raise exception 'UID is immutable';
  end if;
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'manage_booking_prevent_uid_change'
  ) then
    create trigger manage_booking_prevent_uid_change
    before update on public.manage_booking
    for each row execute function public.prevent_uid_change();
  end if;
end $$;

-- RLS
alter table public.manage_booking enable row level security;

do $$ begin
  if exists (select 1 from pg_policies where polname = 'authenticated_read' and tablename = 'manage_booking') then
    drop policy authenticated_read on public.manage_booking;
  end if;
  create policy authenticated_read on public.manage_booking
    for select using (auth.uid() is not null and user_id = auth.uid());
end $$;

do $$ begin
  if exists (select 1 from pg_policies where polname = 'authenticated_insert' and tablename = 'manage_booking') then
    drop policy authenticated_insert on public.manage_booking;
  end if;
  create policy authenticated_insert on public.manage_booking
    for insert with check (auth.uid() is not null and user_id = auth.uid());
end $$;

do $$ begin
  if exists (select 1 from pg_policies where polname = 'authenticated_update' and tablename = 'manage_booking') then
    drop policy authenticated_update on public.manage_booking;
  end if;
  create policy authenticated_update on public.manage_booking
    for update using (auth.uid() is not null and user_id = auth.uid())
    with check (auth.uid() is not null and user_id = auth.uid());
end $$;

do $$ begin
  if exists (select 1 from pg_policies where polname = 'authenticated_delete' and tablename = 'manage_booking') then
    drop policy authenticated_delete on public.manage_booking;
  end if;
  create policy authenticated_delete on public.manage_booking
    for delete using (auth.uid() is not null and user_id = auth.uid());
end $$;
