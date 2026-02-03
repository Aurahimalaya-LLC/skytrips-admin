-- Migration: Add user_id column to bookings table
-- Description: Ensures user_id column exists on the bookings table.

DO $$ 
BEGIN 
    -- user_id
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
