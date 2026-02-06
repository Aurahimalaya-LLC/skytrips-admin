-- Migration to add missing columns to routes table

ALTER TABLE routes
ADD COLUMN IF NOT EXISTS robots_meta JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS content_section_title TEXT,
ADD COLUMN IF NOT EXISTS content_section_description TEXT,
ADD COLUMN IF NOT EXISTS content_section_best_time TEXT,
ADD COLUMN IF NOT EXISTS content_section_duration_stopovers TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_heading TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_description TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_image TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_tags TEXT[],
ADD COLUMN IF NOT EXISTS travel_guide_places TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_getting_around TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_origin_airport TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_time_diff TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_currency TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_power_plugs TEXT;

-- Notify pgrst to reload schema
NOTIFY pgrst, 'reload schema';
