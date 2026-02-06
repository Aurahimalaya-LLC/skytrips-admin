-- Enable RLS on agencies table
alter table public.agencies enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Enable read access for all users" on public.agencies;
drop policy if exists "Enable insert for authenticated users only" on public.agencies;
drop policy if exists "Enable update for authenticated users only" on public.agencies;
drop policy if exists "Enable delete for authenticated users only" on public.agencies;

-- Create permissive read policy (Public)
-- Allows any user (authenticated or anon) to read agencies
-- This is consistent with other tables like companies/airlines in this project
create policy "Enable read access for all users"
on public.agencies for select
using (true);

-- Create write policies for authenticated users only
create policy "Enable insert for authenticated users only"
on public.agencies for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on public.agencies for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
on public.agencies for delete
using (auth.role() = 'authenticated');
