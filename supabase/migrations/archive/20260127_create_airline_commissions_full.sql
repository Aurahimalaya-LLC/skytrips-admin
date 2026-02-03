create table if not exists airline_commissions (
  id uuid default gen_random_uuid() primary key,
  agency_uid uuid references agencies(uid) on delete cascade not null,
  airline_name text not null,
  airline_iata text,
  airline_logo text,
  commission_type text not null check (commission_type in ('PERCENTAGE', 'FIXED')),
  value numeric not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  class_type text default 'All',
  origin text,
  destination text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table airline_commissions enable row level security;

-- Create policies
drop policy if exists "Enable read access for all users" on airline_commissions;
create policy "Enable read access for all users" on airline_commissions for select using (true);

drop policy if exists "Enable insert for all users" on airline_commissions;
create policy "Enable insert for all users" on airline_commissions for insert with check (true);

drop policy if exists "Enable update for all users" on airline_commissions;
create policy "Enable update for all users" on airline_commissions for update using (true);

drop policy if exists "Enable delete for all users" on airline_commissions;
create policy "Enable delete for all users" on airline_commissions for delete using (true);
