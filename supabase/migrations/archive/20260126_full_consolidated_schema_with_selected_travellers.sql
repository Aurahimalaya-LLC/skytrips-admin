-- ==========================================
-- 1. BOOKINGS TABLE UPDATES
-- ==========================================

-- 1. Add the 'travellers' column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS travellers JSONB DEFAULT '[]'::jsonb NOT NULL;

-- 1a. Add the 'itineraries' column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS itineraries JSONB DEFAULT '[]'::jsonb;

-- 2. Add 'customer' column (RENAMED FROM customer_details)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer JSONB DEFAULT '{}'::jsonb;

-- 3. Add descriptions
COMMENT ON COLUMN bookings.travellers IS 'Array of traveller details for the booking';
COMMENT ON COLUMN bookings.customer IS 'Snapshot of full customer details (email, phone, address) at time of booking';
COMMENT ON COLUMN bookings.itineraries IS 'Array of flight itineraries (segments, etc.)';

-- 4. Add new detailed columns for View Booking page
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "passportIssueDate" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "placeOfIssue" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "arrivalDate" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "prices" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "issuedthroughagency" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "departureDate" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "returnDate" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contactType" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "customerType" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons jsonb DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentMethod" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "transactionId" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dateofpayment text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "flightClass" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "flightNumber" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "frequentFlyer" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "stopoverLocation" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "stopoverArrival" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "stopoverDeparture" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "handledBy" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "currencycode" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "nationality" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "passportNumber" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "passportExpiry" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "travellerFirstName" text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "travellerLastName" text;

-- 6. Enable RLS on bookings table 
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 7. Add index on customerid 
CREATE INDEX IF NOT EXISTS idx_bookings_customerid ON bookings(customerid);

-- 8. Policies for bookings 
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
CREATE POLICY "Customers can view own bookings" ON bookings 
FOR SELECT TO authenticated 
USING (customerid IN (SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Customers can insert own bookings" ON bookings;
CREATE POLICY "Customers can insert own bookings" ON bookings 
FOR INSERT TO authenticated 
WITH CHECK (customerid IN (SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings;
CREATE POLICY "Customers can update own bookings" ON bookings 
FOR UPDATE TO authenticated 
USING (customerid IN (SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) 
WITH CHECK (customerid IN (SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- ==========================================
-- 2. TRAVELLERS TABLE (Fixed Policies)
-- ==========================================

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

alter table travellers enable row level security; 

-- DROP POLICIES BEFORE CREATING THEM 
drop policy if exists "Enable read access for all users" on travellers; 
create policy "Enable read access for all users" on travellers for select using (true); 

drop policy if exists "Enable insert access for all users" on travellers; 
create policy "Enable insert access for all users" on travellers for insert with check (true); 

drop policy if exists "Enable update access for all users" on travellers; 
create policy "Enable update access for all users" on travellers for update using (true); 

drop policy if exists "Enable delete access for all users" on travellers; 
create policy "Enable delete access for all users" on travellers for delete using (true); 

-- ==========================================
-- 3. COMPANIES TABLE
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

alter table companies enable row level security; 

drop policy if exists "Enable read access for all users" on companies; 
create policy "Enable read access for all users" on companies for select using (true); 

drop policy if exists "Enable insert for authenticated users only" on companies; 
create policy "Enable insert for authenticated users only" on companies for insert with check (auth.role() = 'authenticated'); 

drop policy if exists "Enable update for authenticated users only" on companies; 
create policy "Enable update for authenticated users only" on companies for update using (auth.role() = 'authenticated'); 

drop policy if exists "Enable delete for authenticated users only" on companies; 
create policy "Enable delete for authenticated users only" on companies for delete using (auth.role() = 'authenticated'); 

-- ==========================================
-- 4. REASONS TABLE (New)
-- ==========================================

create table if not exists public.reasons ( 
    id uuid not null default gen_random_uuid(), 
    code text not null, 
    title text not null, 
    description text, 
    created_at timestamp with time zone default now(), 
    updated_at timestamp with time zone default now(), 
    constraint reasons_pkey primary key (id), 
    constraint reasons_code_key unique (code) 
); 

alter table public.reasons enable row level security; 

drop policy if exists "Enable read access for all users" on public.reasons; 
create policy "Enable read access for all users" on public.reasons for select using (true); 

drop policy if exists "Enable insert for authenticated users only" on public.reasons; 
create policy "Enable insert for authenticated users only" on public.reasons for insert with check (auth.role() = 'authenticated'); 

drop policy if exists "Enable update for authenticated users only" on public.reasons; 
create policy "Enable update for authenticated users only" on public.reasons for update using (auth.role() = 'authenticated'); 

drop policy if exists "Enable delete for authenticated users only" on public.reasons; 
create policy "Enable delete for authenticated users only" on public.reasons for delete using (auth.role() = 'authenticated'); 

-- ==========================================
-- 5. MEDIA TABLE & STORAGE
-- ==========================================

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

ALTER TABLE public.media ADD COLUMN IF NOT EXISTS width INTEGER; 
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS height INTEGER; 
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS duration INTEGER; 

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY; 

DROP POLICY IF EXISTS "Enable read access for all users" ON public.media; 
CREATE POLICY "Enable read access for all users" ON public.media FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.media; 
CREATE POLICY "Enable insert for authenticated users" ON public.media FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 

DROP POLICY IF EXISTS "Enable update for owners" ON public.media; 
CREATE POLICY "Enable update for owners" ON public.media FOR UPDATE USING (auth.uid() = uploaded_by); 

DROP POLICY IF EXISTS "Enable delete for owners" ON public.media; 
CREATE POLICY "Enable delete for owners" ON public.media FOR DELETE USING (auth.uid() = uploaded_by); 

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING; 

DROP POLICY IF EXISTS "Give public access to media files" ON storage.objects; 
CREATE POLICY "Give public access to media files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media'); 

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects; 
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media'); 

DROP POLICY IF EXISTS "Allow owners to update/delete" ON storage.objects; 
CREATE POLICY "Allow owners to update/delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND auth.uid() = owner); 

-- ==========================================
-- 6. MANAGE BOOKING & SETTINGS
-- ==========================================

create table if not exists public.manage_booking ( 
  uid text primary key, 
  booking_id text not null, 
  created_at timestamptz not null default now(), 
  updated_at timestamptz, 
  user_id uuid 
); 

-- Add missing columns for manage_booking
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Refund';
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS booking_details JSONB;
-- New column for selected travellers
ALTER TABLE public.manage_booking ADD COLUMN IF NOT EXISTS selected_travellers TEXT[];

alter table public.manage_booking enable row level security; 

drop policy if exists authenticated_read on public.manage_booking; 
create policy authenticated_read on public.manage_booking for select using (auth.uid() is not null and user_id = auth.uid()); 

drop policy if exists authenticated_insert on public.manage_booking; 
create policy authenticated_insert on public.manage_booking for insert with check (auth.uid() is not null and user_id = auth.uid()); 

drop policy if exists authenticated_update on public.manage_booking; 
create policy authenticated_update on public.manage_booking for update using (auth.uid() is not null and user_id = auth.uid()); 

drop policy if exists authenticated_delete on public.manage_booking; 
create policy authenticated_delete on public.manage_booking for delete using (auth.uid() is not null and user_id = auth.uid()); 

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

CREATE UNIQUE INDEX IF NOT EXISTS settings_singleton_idx ON settings ((TRUE)); 
ALTER TABLE settings ENABLE ROW LEVEL SECURITY; 

DROP POLICY IF EXISTS "Allow public read settings" ON settings; 
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Allow authenticated update settings" ON settings; 
CREATE POLICY "Allow authenticated update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated'); 

DROP POLICY IF EXISTS "Allow authenticated insert settings" ON settings; 
CREATE POLICY "Allow authenticated insert settings" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 

NOTIFY pgrst, 'reload schema'; 
