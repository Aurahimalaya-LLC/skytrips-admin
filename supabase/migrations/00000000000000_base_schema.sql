-- ==========================================
-- BASE SCHEMA - Creates all core tables
-- This must run BEFORE all other migrations
-- ==========================================

-- ==========================================
-- 1. CUSTOMERS TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    phone TEXT,
    address TEXT,
    nationality TEXT,
    dob DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Public read for now (will be overridden by later migrations)
DROP POLICY IF EXISTS "Enable read access for customers" ON public.customers;
CREATE POLICY "Enable read access for customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for customers" ON public.customers;
CREATE POLICY "Enable insert for customers" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for customers" ON public.customers;
CREATE POLICY "Enable update for customers" ON public.customers FOR UPDATE USING (true);

-- ==========================================
-- 2. BOOKINGS TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customerid UUID REFERENCES public.customers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pnr TEXT,
    status TEXT,
    total_price NUMERIC,
    currency TEXT DEFAULT 'USD',
    flight_data JSONB DEFAULT '{}'::jsonb,
    origin TEXT,
    destination TEXT,
    travel_date TIMESTAMPTZ,
    trip_type TEXT
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public access for now (will be overridden by later migrations)
DROP POLICY IF EXISTS "Public bookings access" ON public.bookings;
CREATE POLICY "Public bookings access" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public bookings insert" ON public.bookings;
CREATE POLICY "Public bookings insert" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public bookings update" ON public.bookings;
CREATE POLICY "Public bookings update" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public bookings delete" ON public.bookings;
CREATE POLICY "Public bookings delete" ON public.bookings FOR DELETE USING (true);

-- ==========================================
-- 3. TRAVELLERS TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.travellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    passport_number TEXT,
    passport_expiry DATE,
    dob DATE,
    nationality TEXT,
    gender TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.travellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for travellers" ON public.travellers;
CREATE POLICY "Enable read access for travellers" ON public.travellers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for travellers" ON public.travellers;
CREATE POLICY "Enable insert for travellers" ON public.travellers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for travellers" ON public.travellers;
CREATE POLICY "Enable update for travellers" ON public.travellers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for travellers" ON public.travellers;
CREATE POLICY "Enable delete for travellers" ON public.travellers FOR DELETE USING (true);

-- ==========================================
-- 4. AIRLINES TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    logo_url TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for airlines" ON public.airlines;
CREATE POLICY "Enable read access for airlines" ON public.airlines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated airlines" ON public.airlines;
CREATE POLICY "Enable write for authenticated airlines" ON public.airlines FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 5. AIRPORTS TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    city TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for airports" ON public.airports;
CREATE POLICY "Enable read access for airports" ON public.airports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated airports" ON public.airports;
CREATE POLICY "Enable write for authenticated airports" ON public.airports FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 6. ROUTES TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin TEXT,
    destination TEXT,
    airline_code TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'AUD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for routes" ON public.routes;
CREATE POLICY "Enable read access for routes" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated routes" ON public.routes;
CREATE POLICY "Enable write for authenticated routes" ON public.routes FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 7. SERVICES TABLE (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'AUD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for services" ON public.services;
CREATE POLICY "Enable read access for services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated services" ON public.services;
CREATE POLICY "Enable write for authenticated services" ON public.services FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 8. USERS TABLE (Core - for admin)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for users" ON public.users;
CREATE POLICY "Enable read access for users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.users;
CREATE POLICY "Enable write for authenticated users" ON public.users FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 9. HELPER FUNCTIONS
-- ==========================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- set_updated_at function (used by some migrations)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
