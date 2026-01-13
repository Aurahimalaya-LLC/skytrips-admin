-- ==========================================
-- 1. BOOKINGS TABLE UPDATES
-- ==========================================

-- 1. Add the 'travellers' column 
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS travellers JSONB DEFAULT '[]'::jsonb NOT NULL; 

-- 2. Add 'customer' column (RENAMED FROM customer_details) 
-- This stores the full snapshot of customer info (id, name, email, etc.) 
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer JSONB DEFAULT '{}'::jsonb; 

-- 3. Add descriptions 
COMMENT ON COLUMN bookings.travellers IS 'Array of traveller details for the booking'; 
COMMENT ON COLUMN bookings.customer IS 'Snapshot of full customer details (email, phone, address) at time of booking'; 

-- 5. Enable RLS on bookings table (if not already enabled) 
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY; 

-- 6. Add index on customerid for performance 
CREATE INDEX IF NOT EXISTS idx_bookings_customerid ON bookings(customerid); 

-- 7. Create policy to allow users to view their own bookings 
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings; 

CREATE POLICY "Customers can view own bookings" ON bookings 
FOR SELECT 
TO authenticated 
USING ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
); 

-- 8. Create policy to allow users to insert their own bookings 
DROP POLICY IF EXISTS "Customers can insert own bookings" ON bookings; 

CREATE POLICY "Customers can insert own bookings" ON bookings 
FOR INSERT 
TO authenticated 
WITH CHECK ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
); 

-- 9. Create policy to allow users to update their own bookings 
DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings; 

CREATE POLICY "Customers can update own bookings" ON bookings 
FOR UPDATE 
TO authenticated 
USING ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
) 
WITH CHECK ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
);

-- ==========================================
-- 2. COMPANIES TABLE CREATION (New)
-- ==========================================

create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  emails jsonb not null default '[]'::jsonb,
  phones jsonb not null default '[]'::jsonb,
  website text,
  is_headquarters boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Enable Row Level Security
alter table companies enable row level security;

-- Create policies for companies
drop policy if exists "Enable read access for all users" on companies;
create policy "Enable read access for all users" on companies for select using (true);

drop policy if exists "Enable insert for authenticated users only" on companies;
create policy "Enable insert for authenticated users only" on companies for insert with check (auth.role() = 'authenticated');

drop policy if exists "Enable update for authenticated users only" on companies;
create policy "Enable update for authenticated users only" on companies for update using (auth.role() = 'authenticated');

drop policy if exists "Enable delete for authenticated users only" on companies;
create policy "Enable delete for authenticated users only" on companies for delete using (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger for companies
drop trigger if exists update_companies_updated_at on companies;
create trigger update_companies_updated_at
before update on companies
for each row
execute function update_updated_at_column();

-- ==========================================
-- 3. REFRESH SCHEMA
-- ==========================================
NOTIFY pgrst, 'reload schema';
