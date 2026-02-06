-- Finalize Routes Schema
-- Adds all potentially missing columns to support the full RouteForm functionality

ALTER TABLE routes
-- Hero Section (Multi-slide)
ADD COLUMN IF NOT EXISTS hero_sections JSONB DEFAULT '[]'::jsonb,

-- Things to Note
ADD COLUMN IF NOT EXISTS things_to_note_origin_airport TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_time_diff TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_currency TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_power_plugs TEXT,

-- Travel Guide
ADD COLUMN IF NOT EXISTS travel_guide_heading TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_description TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_image TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS travel_guide_places TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_getting_around TEXT,

-- Content Section
ADD COLUMN IF NOT EXISTS content_section_title TEXT,
ADD COLUMN IF NOT EXISTS content_section_description TEXT,
ADD COLUMN IF NOT EXISTS content_section_best_time TEXT,
ADD COLUMN IF NOT EXISTS content_section_duration_stopovers TEXT,

-- Ensure SEO and Slug exist (from previous steps)
ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug if not exists
CREATE INDEX IF NOT EXISTS idx_routes_slug ON routes(slug);

-- Notify Supabase to reload schema
NOTIFY pgrst, 'reload schema';
