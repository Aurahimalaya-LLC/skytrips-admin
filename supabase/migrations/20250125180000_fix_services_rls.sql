-- Drop restrictive policies
drop policy if exists "Enable insert for authenticated users only" on services;
drop policy if exists "Enable update for authenticated users only" on services;
drop policy if exists "Enable delete for authenticated users only" on services;
drop policy if exists "Enable read access for all users" on services;

-- Create permissive policy for development
create policy "Enable all access for all users"
on services for all
using (true)
with check (true);
