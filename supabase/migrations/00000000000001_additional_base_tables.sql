-- ==========================================
-- ADDITIONAL BASE TABLES
-- Required by later migrations
-- ==========================================

-- ==========================================
-- 1. AGENCIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.agencies (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    contact_person TEXT,
    number TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for agencies" ON public.agencies;
CREATE POLICY "Enable read access for agencies" ON public.agencies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated agencies" ON public.agencies;
CREATE POLICY "Enable write for authenticated agencies" ON public.agencies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated agencies" ON public.agencies;
CREATE POLICY "Enable update for authenticated agencies" ON public.agencies FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated agencies" ON public.agencies;
CREATE POLICY "Enable delete for authenticated agencies" ON public.agencies FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- 2. PAYMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    payment_method TEXT,
    selling_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for payments" ON public.payments;
CREATE POLICY "Enable read access for payments" ON public.payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write for authenticated payments" ON public.payments;
CREATE POLICY "Enable write for authenticated payments" ON public.payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated payments" ON public.payments;
CREATE POLICY "Enable update for authenticated payments" ON public.payments FOR UPDATE USING (auth.role() = 'authenticated');

-- Add agency_id to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(uid);

-- Add sellingPrice and buyingPrice columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "sellingPrice" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS sellingprice TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "buyingPrice" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS buyingprice TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paymentmethod TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paymentstatus TEXT;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
