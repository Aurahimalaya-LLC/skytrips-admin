create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text not null,
  pricing_type text not null,
  base_price numeric(10, 2) not null,
  status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies if needed, but for now assuming admin access overrides or open for this dashboard
alter table services enable row level security;

create policy "Enable read access for all users"
on services for select
using (true);

create policy "Enable insert for authenticated users only"
on services for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on services for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
on services for delete
using (auth.role() = 'authenticated');
