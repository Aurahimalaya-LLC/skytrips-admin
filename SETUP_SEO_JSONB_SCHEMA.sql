-- Comprehensive Schema for SEO Settings (JSONB)
-- Migrates flat SEO columns to a structured 'seo_settings' JSONB column

-- 1. Create the JSONB column and ensure slug exists
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_routes_slug ON routes(slug);

-- 2. Migrate existing flat data to JSONB structure
-- We preserve the 'slug' as a top-level column for routing performance
DO $$
DECLARE
    has_legacy_columns boolean;
BEGIN
    -- Check if the main legacy column 'seo_title' exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'routes' 
        AND column_name = 'seo_title'
    ) INTO has_legacy_columns;

    IF has_legacy_columns THEN
        -- Only run migration if legacy columns exist to avoid "column does not exist" errors
        EXECUTE '
            UPDATE routes
            SET seo_settings = jsonb_build_object(
                ''title'', seo_title,
                ''description'', meta_description,
                ''canonical_url'', canonical_url,
                ''schema_markup'', schema_markup,
                ''robots'', COALESCE(robots_meta, ''{}''::jsonb)
            )
            WHERE seo_title IS NOT NULL 
               OR meta_description IS NOT NULL 
               OR canonical_url IS NOT NULL 
               OR schema_markup IS NOT NULL 
               OR robots_meta IS NOT NULL';
        RAISE NOTICE 'Migrated legacy SEO data to JSONB.';
    ELSE
        RAISE NOTICE 'Legacy SEO columns not found. Skipping data migration.';
    END IF;
    
    -- Backfill slug if missing (safe to do here as we ensured column exists)
    UPDATE routes 
    SET slug = lower('flights-from-' || departure_airport || '-to-' || arrival_airport)
    WHERE slug IS NULL 
      AND departure_airport IS NOT NULL 
      AND arrival_airport IS NOT NULL;
      
    RAISE NOTICE 'Backfilled missing slugs.';
END $$;

-- 3. GIN Index for JSONB querying
CREATE INDEX IF NOT EXISTS idx_routes_seo_settings ON routes USING GIN (seo_settings);

-- 4. Constraint: Ensure seo_settings is an object
ALTER TABLE routes
ADD CONSTRAINT chk_seo_settings_is_object 
CHECK (jsonb_typeof(seo_settings) = 'object');

-- 5. Helper View for easier querying (flattens the structure)
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

-- 6. Trigger for Audit (Update timestamp) - standard practice
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_routes_modtime ON routes;
CREATE TRIGGER trg_update_routes_modtime
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Drop old columns to cleanup (Optional - uncomment to finalize)
-- ALTER TABLE routes DROP COLUMN IF EXISTS seo_title;
-- ALTER TABLE routes DROP COLUMN IF EXISTS meta_description;
-- ALTER TABLE routes DROP COLUMN IF EXISTS canonical_url;
-- ALTER TABLE routes DROP COLUMN IF EXISTS schema_markup;
-- ALTER TABLE routes DROP COLUMN IF EXISTS robots_meta;

-- 8. RLS Policy (Ensure public read access for SEO data)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public routes are viewable by everyone" 
ON routes FOR SELECT 
USING (true); -- Adjust based on 'status' column if needed (e.g. status = 'published')

-- 9. Function to auto-generate slug if missing (Optional utility)
CREATE OR REPLACE FUNCTION generate_slug_from_airports()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower('flights-from-' || NEW.departure_airport || '-to-' || NEW.arrival_airport);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_slug ON routes;
CREATE TRIGGER trg_generate_slug
    BEFORE INSERT ON routes
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_airports();

NOTIFY pgrst, 'reload schema';
