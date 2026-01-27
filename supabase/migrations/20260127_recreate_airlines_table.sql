-- Recreate airlines table to ensure all columns exist
DROP TABLE IF EXISTS airlines;

create table airlines (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  iata_code text not null,
  country text not null,
  commission_rate numeric default 0,
  logo_url text,
  status text default 'Active' check (status in ('Active', 'Inactive', 'Pending'))
);

-- Enable Row Level Security (RLS)
alter table airlines enable row level security;

-- Create policies
create policy "Enable read access for all users" on airlines for select using (true);
create policy "Enable insert for all users" on airlines for insert with check (true);
create policy "Enable update for all users" on airlines for update using (true);
create policy "Enable delete for all users" on airlines for delete using (true);
