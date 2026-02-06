-- Rollback script for Hero Section migration
-- This restores the original column structure if needed

-- 1. Ensure old columns exist (if they were dropped)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS hero_headline TEXT;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

-- 2. Restore data from the first element of the array
-- We assume the first slide is the primary one
UPDATE routes
SET 
  hero_headline = hero_sections->0->>'headline',
  hero_subtitle = hero_sections->0->>'subtitle'
WHERE hero_sections IS NOT NULL 
  AND jsonb_array_length(hero_sections) > 0;

-- 3. Drop the new JSONB column (Optional - comment out if you want to keep both)
-- ALTER TABLE routes DROP COLUMN hero_sections;

-- 4. Refresh Schema
NOTIFY pgrst, 'reload schema';
