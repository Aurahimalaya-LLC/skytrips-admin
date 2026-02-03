-- Migration: Add missing columns to bookings table
-- Description: Ensures contact_details and other potentially missing columns exist on the bookings table.

DO $$ 
BEGIN 
    -- contact_details
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN contact_details JSONB DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- trip_type
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN trip_type TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- flight_data
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN flight_data JSONB DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- currency
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN currency TEXT DEFAULT 'USD';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- total_price
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN total_price NUMERIC;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    -- pnr
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN pnr TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

     -- origin
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN origin TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

     -- destination
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN destination TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

     -- travel_date
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN travel_date TIMESTAMPTZ;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
