-- Add other_popular_airlines column to airlines table
-- This column will store an array of JSON objects containing basic airline info or just an array of IDs
-- Let's stick to an array of airline IDs (UUIDs) or an array of JSON objects for faster display without joins
-- Decision: Array of JSON objects {id, name, iata_code} to avoid heavy joins on display

ALTER TABLE airlines ADD COLUMN IF NOT EXISTS other_popular_airlines JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN airlines.other_popular_airlines IS 'List of other popular airlines related to this airline (JSON array of objects)';
