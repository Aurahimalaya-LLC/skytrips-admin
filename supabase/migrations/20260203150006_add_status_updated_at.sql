-- Migration: Add status and updated_at columns to bookings table
-- Description: Ensures status and updated_at columns exist on the bookings table.

DO $$ 
BEGIN 
    -- status
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN status TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- updated_at
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
