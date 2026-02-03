-- Add booking_reference column if it doesn't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.bookings ADD COLUMN booking_reference TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
