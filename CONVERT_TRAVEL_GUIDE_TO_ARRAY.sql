
-- 1. Create a Type for the "Travel Guide" structure
-- This defines the structure of a single travel guide item
CREATE TYPE travel_guide_item AS (
    heading TEXT,
    description TEXT,
    image_url TEXT,
    tags TEXT[],
    places_of_interest TEXT,
    getting_around TEXT
);

-- 2. Add the column to the routes table as an ARRAY of this type
-- Using a composite type array enforces strict schema validation
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS travel_guide_sections travel_guide_item[];

-- ALTERNATIVE: JSONB Approach (Recommended for flexibility)
-- This maps directly to JavaScript arrays of objects and is easier to handle in frontend
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS travel_guide_list JSONB DEFAULT '[]'::jsonb;

-- Example Data Format for JSONB column:
-- [
--   {
--     "heading": "Discover Kathmandu",
--     "description": "Kathmandu, the capital of Nepal...",
--     "image_url": "https://example.com/ktm.jpg",
--     "tags": ["Culture", "History", "Nature"],
--     "places_of_interest": "Swayambhunath, Pashupatinath...",
--     "getting_around": "Taxis are readily available..."
--   }
-- ]
