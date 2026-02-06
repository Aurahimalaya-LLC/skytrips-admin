-- SQL Migration to ensure 'description' exists in 'content_sections' JSONB column

-- 1. Migrate legacy 'content_section_description' column data if it exists and hasn't been migrated yet
DO $$
BEGIN
    -- Check if the legacy column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'content_section_description') THEN
        
        -- Update content_sections with value from legacy column if content_sections doesn't have it yet
        UPDATE routes
        SET content_sections = jsonb_set(
            COALESCE(content_sections, '{}'::jsonb),
            '{description}',
            to_jsonb(content_section_description)
        )
        WHERE content_section_description IS NOT NULL 
          AND (content_sections->>'description') IS NULL;
          
        RAISE NOTICE 'Migrated legacy content_section_description to content_sections JSONB.';
    END IF;
END $$;

-- 2. Initialize 'description' key in content_sections for all records where it is missing
-- This ensures the field is present in the JSON structure, even if empty
UPDATE routes
SET content_sections = COALESCE(content_sections, '{}'::jsonb) || '{"description": ""}'::jsonb
WHERE content_sections->>'description' IS NULL;

-- 3. Notify to reload schema
NOTIFY pgrst, 'reload schema';
