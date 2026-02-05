-- Add Travel Guide columns to routes table
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS travel_guide_heading TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_description TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_image TEXT,
ADD COLUMN IF NOT EXISTS travel_guide_tags TEXT[], -- Array of strings for tags like "History", "Nature"
ADD COLUMN IF NOT EXISTS travel_guide_places TEXT, -- Storing rich text or JSON for "Places of Interest"
ADD COLUMN IF NOT EXISTS travel_guide_getting_around TEXT; -- Storing rich text or JSON for "Getting Around"
