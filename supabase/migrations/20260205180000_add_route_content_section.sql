-- Add Content Section columns to routes table
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS content_section_title TEXT,
ADD COLUMN IF NOT EXISTS content_section_description TEXT,
ADD COLUMN IF NOT EXISTS content_section_best_time TEXT,
ADD COLUMN IF NOT EXISTS content_section_duration_stopovers TEXT;
