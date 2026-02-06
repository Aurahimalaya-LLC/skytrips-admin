-- SQL Migration to implement 'content_sections' JSONB column
-- This moves flat content columns into a structured JSONB object

-- 1. Create the new JSONB column
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS content_sections JSONB DEFAULT '{}'::jsonb;

-- 2. Migrate existing flat data to JSONB structure
DO $$
DECLARE
    has_legacy_columns boolean;
BEGIN
    -- Check if one of the legacy columns exists to decide if migration is needed
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'routes' 
        AND column_name = 'content_section_title'
    ) INTO has_legacy_columns;

    IF has_legacy_columns THEN
        UPDATE routes
        SET content_sections = jsonb_build_object(
            'title', content_section_title,
            'description', content_section_description,
            'best_time', content_section_best_time,
            'duration_stopovers', content_section_duration_stopovers
        )
        WHERE content_section_title IS NOT NULL 
           OR content_section_description IS NOT NULL 
           OR content_section_best_time IS NOT NULL 
           OR content_section_duration_stopovers IS NOT NULL;
           
        RAISE NOTICE 'Migrated legacy content fields to content_sections JSONB.';
    ELSE
        RAISE NOTICE 'Legacy content columns not found. Skipping data migration.';
    END IF;
END $$;

-- 3. Notify pgrst to reload schema
NOTIFY pgrst, 'reload schema';
