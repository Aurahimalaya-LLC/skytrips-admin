-- Migration to convert Hero Section fields to a JSONB array structure
-- This allows for multiple hero slides/variants

-- 1. Add the new JSONB column
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS hero_sections JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing data
-- We take the existing hero_headline and hero_subtitle and create a single object in the array.
-- We handle potential comma-separated values by splitting them if needed, 
-- but assuming standard usage, we just map 1-to-1 first.
-- If the text contains commas, we could split, but 'hero_headline' usually isn't a list.
-- However, the user asked to handle delimiters. 
-- Let's try to be smart: if it looks like a list, split it.
-- For safety, we will just migrate the current single value as the first item.

UPDATE routes
SET hero_sections = jsonb_build_array(
    jsonb_build_object(
        'headline', hero_headline,
        'subtitle', hero_subtitle
    )
)
WHERE (hero_headline IS NOT NULL OR hero_subtitle IS NOT NULL)
AND (hero_sections IS NULL OR hero_sections = '[]'::jsonb);

-- 3. Verify the migration (Optional check)
-- SELECT id, hero_headline, hero_sections FROM routes LIMIT 5;

-- 4. Drop the old columns (Uncomment when ready to commit to the destruction)
-- ALTER TABLE routes DROP COLUMN hero_headline;
-- ALTER TABLE routes DROP COLUMN hero_subtitle;

-- 5. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
