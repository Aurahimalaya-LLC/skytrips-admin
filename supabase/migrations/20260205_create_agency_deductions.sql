-- Create agency_deductions table for tracking SQuAD and other process deductions
create table if not exists agency_deductions (
  id uuid default gen_random_uuid() primary key,
  agency_uid uuid references agencies(uid) on delete cascade not null,
  amount numeric not null check (amount >= 0), -- Stored as positive value representing the deduction
  currency text default 'AUD',
  category text default 'SQ', -- 'SQ', 'SQuAD', 'Admin', etc.
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- Enable RLS
alter table agency_deductions enable row level security;

-- Policies
create policy "Enable read access for all users" on agency_deductions for select using (true);
create policy "Enable insert for authenticated users" on agency_deductions for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on agency_deductions for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users" on agency_deductions for delete using (auth.role() = 'authenticated');

-- Seed some dummy data for testing 'SQ' deductions
-- Assuming we have some agencies. We'll verify agency UIDs dynamically in a real seed, 
-- but for now we can just let the app handle it or insert if we know UIDs.
-- (Skipping static seed here to avoid foreign key errors if UIDs don't match, 
-- but the hook will handle empty state gracefully).
