-- Add extended fields to airlines table
ALTER TABLE airlines 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS alliance text,
ADD COLUMN IF NOT EXISTS airline_type text,
ADD COLUMN IF NOT EXISTS destinations_count integer,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;

-- Add index for slug if it exists (optional but good for lookups)
CREATE INDEX IF NOT EXISTS idx_airlines_slug ON airlines(slug);
