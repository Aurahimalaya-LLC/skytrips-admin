-- Fix airports table RLS policies to ensure autocomplete works
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to airports
DROP POLICY IF EXISTS "Allow public read access to airports" ON public.airports;
CREATE POLICY "Allow public read access to airports"
ON public.airports
FOR SELECT
TO public
USING (true);

-- Create index for faster search
CREATE INDEX IF NOT EXISTS idx_airports_name_trgm ON public.airports USING gin (name gin_trgm_ops);
