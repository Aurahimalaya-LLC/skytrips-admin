-- Add hero_headline and hero_subtitle columns to airlines table

ALTER TABLE airlines ADD COLUMN IF NOT EXISTS hero_headline TEXT;
ALTER TABLE airlines ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

-- Comment on columns
COMMENT ON COLUMN airlines.hero_headline IS 'Custom headline text for the airline hero section';
COMMENT ON COLUMN airlines.hero_subtitle IS 'Custom subtitle text for the airline hero section';
