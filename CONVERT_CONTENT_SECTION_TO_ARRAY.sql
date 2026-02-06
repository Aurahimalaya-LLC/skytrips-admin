
-- 1. Create a Type for the "Content Section" structure
CREATE TYPE content_section_item AS (
    title TEXT,
    description TEXT,
    best_time_to_visit TEXT,
    flight_duration_and_stopovers TEXT
);

-- 2. Add the column to the routes table as an ARRAY of this type
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS content_section_list content_section_item[];

-- ALTERNATIVE: JSONB Approach (Recommended for flexibility)
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS content_sections JSONB DEFAULT '[]'::jsonb;

-- Example Data Format for JSONB column:
-- [
--   {
--     "title": "Cheap flights from SYD to KTM",
--     "description": "Booking early is best...",
--     "best_time_to_visit": "October to December is ideal...",
--     "flight_duration_and_stopovers": "Approx 15 hours with one stop..."
--   }
-- ]
