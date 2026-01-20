create table if not exists travellers (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  passport_number text,
  passport_expiry date,
  dob date,
  nationality text,
  gender text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table travellers enable row level security;

-- Create policies
create policy "Enable read access for all users" on travellers for select using (true);
create policy "Enable insert access for all users" on travellers for insert with check (true);
create policy "Enable update access for all users" on travellers for update using (true);
create policy "Enable delete access for all users" on travellers for delete using (true);
