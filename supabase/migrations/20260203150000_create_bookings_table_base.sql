-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    pnr TEXT,
    status TEXT,
    total_price NUMERIC,
    currency TEXT DEFAULT 'USD',
    flight_data JSONB DEFAULT '{}'::jsonb,
    origin TEXT,
    destination TEXT,
    travel_date TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id),
    contact_details JSONB DEFAULT '{}'::jsonb,
    trip_type TEXT
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add missing columns (idempotent)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN travellers JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN itineraries JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.bookings ADD COLUMN customer JSONB DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN customerid UUID;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.bookings ADD COLUMN prices JSONB DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.bookings ADD COLUMN email TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.bookings ADD COLUMN phone TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN booking_reference TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Create booking_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.booking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'AMADEUS_BOOKING',
    request_payload JSONB,
    response_payload JSONB,
    status TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.booking_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow all users to view bookings (TEMPORARY FIX for visibility)
DROP POLICY IF EXISTS "Public bookings access" ON public.bookings;
CREATE POLICY "Public bookings access" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public bookings insert" ON public.bookings;
CREATE POLICY "Public bookings insert" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public booking_logs access" ON public.booking_logs;
CREATE POLICY "Public booking_logs access" ON public.booking_logs FOR SELECT USING (true);
