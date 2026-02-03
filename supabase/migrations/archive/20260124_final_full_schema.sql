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

-- 4. Add new detailed columns for View Booking page
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "passportIssueDate" text;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "placeOfIssue" text;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "arrivalDate" text;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD';

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "prices" jsonb DEFAULT '{}'::jsonb;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "issuedthroughagency" text;

-- 5. Add date columns for explicit departure/return (vs generic travelDate)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "departureDate" text;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "returnDate" text;

-- 6. Enable RLS on bookings table (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 7. Add index on customerid for performance
CREATE INDEX IF NOT EXISTS idx_bookings_customerid ON bookings(customerid);

-- 8. Create policy to allow users to view their own bookings
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

-- 9. Create policy to allow users to insert their own bookings
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

-- 10. Create policy to allow users to update their own bookings
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
-- 3. MEDIA TABLE & STORAGE SETUP (Added)
-- ==========================================

-- 3.1 Create Media Table
CREATE TABLE IF NOT EXISTS public.media ( 
    media_id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
    title TEXT, 
    file_path TEXT NOT NULL, 
    mime_type TEXT, 
    file_size BIGINT, 
    uploaded_by UUID REFERENCES auth.users(id), 
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW(), 
    alt_text TEXT, 
    caption TEXT, 
    width INTEGER, 
    height INTEGER, 
    duration INTEGER 
);

-- 3.2 Add missing columns if table already exists (Idempotent check)
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 3.3 Enable RLS for Media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 3.4 Create Policies for Media Table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.media;
CREATE POLICY "Enable read access for all users" ON public.media 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.media;
CREATE POLICY "Enable insert for authenticated users" ON public.media 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for owners" ON public.media;
CREATE POLICY "Enable update for owners" ON public.media 
    FOR UPDATE USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Enable delete for owners" ON public.media;
CREATE POLICY "Enable delete for owners" ON public.media 
    FOR DELETE USING (auth.uid() = uploaded_by);

-- 3.5 Storage Bucket Setup (via SQL)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- 3.6 Storage Policies
-- Allow public read access
DROP POLICY IF EXISTS "Give public access to media files" ON storage.objects;
CREATE POLICY "Give public access to media files" ON storage.objects 
    FOR SELECT 
    TO public 
    USING (bucket_id = 'media');

-- Allow authenticated uploads
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'media');

-- Allow owners to delete/update their own files
DROP POLICY IF EXISTS "Allow owners to update/delete" ON storage.objects;
CREATE POLICY "Allow owners to update/delete" ON storage.objects 
    FOR DELETE 
    TO authenticated 
    USING ( 
        bucket_id = 'media' 
        AND auth.uid() = owner 
    );

-- ==========================================
-- 4. MANAGE BOOKING TABLE (New)
-- ==========================================

create table if not exists public.manage_booking (
  uid text primary key,
  booking_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  user_id uuid
);

-- Triggers for manage_booking
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

-- RLS for manage_booking
alter table public.manage_booking enable row level security;

-- Policies for manage_booking (Authenticated users can manage their own records)
drop policy if exists authenticated_read on public.manage_booking;
create policy authenticated_read on public.manage_booking
  for select using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists authenticated_insert on public.manage_booking;
create policy authenticated_insert on public.manage_booking
  for insert with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists authenticated_update on public.manage_booking;
create policy authenticated_update on public.manage_booking
  for update using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists authenticated_delete on public.manage_booking;
create policy authenticated_delete on public.manage_booking
  for delete using (auth.uid() is not null and user_id = auth.uid());


-- ==========================================
-- 5. SETTINGS TABLE
-- ==========================================

-- Create settings table
CREATE TABLE IF NOT EXISTS settings ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  company_name TEXT, 
  company_email TEXT, 
  company_phone TEXT, 
  currency TEXT DEFAULT 'USD', 
  date_format TEXT DEFAULT 'MM/DD/YYYY', 
  notifications BOOLEAN DEFAULT true, 
  logo_url TEXT, 
  favicon_url TEXT, 
  company_profiles JSONB DEFAULT '[]'::jsonb, 
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  updated_at TIMESTAMPTZ DEFAULT NOW() 
); 

-- Singleton constraint 
CREATE UNIQUE INDEX IF NOT EXISTS settings_singleton_idx ON settings ((TRUE)); 

-- RLS 
ALTER TABLE settings ENABLE ROW LEVEL SECURITY; 

-- Policies 
DROP POLICY IF EXISTS "Allow public read settings" ON settings;
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Allow authenticated update settings" ON settings;
CREATE POLICY "Allow authenticated update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated'); 

DROP POLICY IF EXISTS "Allow authenticated insert settings" ON settings;
CREATE POLICY "Allow authenticated insert settings" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 6. REFRESH SCHEMA
-- ==========================================
NOTIFY pgrst, 'reload schema'; 
