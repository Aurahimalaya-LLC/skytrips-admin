-- Add travellers column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS travellers JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Comment on column
COMMENT ON COLUMN bookings.travellers IS 'Array of traveller details for the booking';

-- Update existing records to populate travellers array from legacy flat fields if empty
-- This is a one-time migration to ensure backward compatibility
UPDATE bookings
SET travellers = jsonb_build_array(
  jsonb_build_object(
    'firstName', "travellerFirstName",
    'lastName', "travellerLastName",
    'passportNumber', "passportNumber",
    'passportExpiry', "passportExpiry",
    'dob', "dob",
    'nationality', "nationality"
  )
)
WHERE travellers = '[]'::jsonb 
  AND "travellerFirstName" IS NOT NULL 
  AND "travellerFirstName" != '';
