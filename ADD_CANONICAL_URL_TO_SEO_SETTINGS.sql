-- SQL Migration to ensure 'canonical_url' exists in 'seo_settings' JSONB column

-- 1. Migrate legacy 'canonical_url' column data if it exists and hasn't been migrated yet
DO $$
BEGIN
    -- Check if the legacy column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'canonical_url') THEN
        
        -- Update seo_settings with value from legacy column if seo_settings doesn't have it yet
        UPDATE routes
        SET seo_settings = jsonb_set(
            COALESCE(seo_settings, '{}'::jsonb),
            '{canonical_url}',
            to_jsonb(canonical_url)
        )
        WHERE canonical_url IS NOT NULL 
          AND (seo_settings->>'canonical_url') IS NULL;
          
        RAISE NOTICE 'Migrated legacy canonical_url to seo_settings JSONB.';
    END IF;
END $$;

-- 2. Initialize 'canonical_url' key in seo_settings for all records where it is missing
-- This ensures the field is present in the JSON structure, even if empty
UPDATE routes
SET seo_settings = COALESCE(seo_settings, '{}'::jsonb) || '{"canonical_url": ""}'::jsonb
WHERE seo_settings->>'canonical_url' IS NULL;

-- 3. Update the helper view to explicitly include canonical_url
CREATE OR REPLACE VIEW routes_seo_view AS
SELECT 
    id,
    slug,
    seo_settings->>'title' as seo_title,
    seo_settings->>'description' as meta_description,
    seo_settings->>'canonical_url' as canonical_url,
    seo_settings->>'schema_markup' as schema_markup,
    seo_settings->'robots' as robots_meta
FROM routes;

-- 4. Notify to reload schema
NOTIFY pgrst, 'reload schema';
