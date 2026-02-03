-- Add new columns to airports table for enhanced details
ALTER TABLE airports 
ADD COLUMN IF NOT EXISTS featured_image_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS fast_facts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS top_airlines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS map_embed_code text;

-- Add comments for documentation
COMMENT ON COLUMN airports.featured_image_url IS 'URL of the main featured image';
COMMENT ON COLUMN airports.description IS 'Detailed description of the airport';
COMMENT ON COLUMN airports.fast_facts IS 'Array of key-value pairs for quick facts';
COMMENT ON COLUMN airports.top_airlines IS 'Array of airline names or codes';
COMMENT ON COLUMN airports.gallery_urls IS 'Array of image URLs for the gallery';
COMMENT ON COLUMN airports.faqs IS 'Array of question-answer pairs';
COMMENT ON COLUMN airports.map_embed_code IS 'HTML embed code for the map (e.g. Google Maps)';
