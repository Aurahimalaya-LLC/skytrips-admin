-- Fix for missing 'number' column in 'agencies' table

-- 1. Add the missing column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'number') THEN
        ALTER TABLE public.agencies ADD COLUMN number text;
    END IF;
END $$;

-- 2. Force schema cache reload (Supabase specific)
NOTIFY pgrst, 'reload schema';
