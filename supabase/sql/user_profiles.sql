create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  role text default 'user',
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create or replace function public.user_profiles_set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'user_profiles_set_updated_at') then
    create trigger user_profiles_set_updated_at before update on public.user_profiles
    for each row execute function public.user_profiles_set_updated_at();
  end if;
end $$;

alter table public.user_profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'user_profiles_select_self' and tablename = 'user_profiles') then
    create policy user_profiles_select_self on public.user_profiles
      for select using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where polname = 'user_profiles_update_self' and tablename = 'user_profiles') then
    create policy user_profiles_update_self on public.user_profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;
