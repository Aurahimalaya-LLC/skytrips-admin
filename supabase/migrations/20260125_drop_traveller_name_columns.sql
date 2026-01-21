-- 1. Migrate existing data: Populate array from legacy flat fields
-- This ensures that any records that still have flat data but empty JSONB array get migrated.
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
WHERE (travellers = '[]'::jsonb OR travellers IS NULL)
  AND "travellerFirstName" IS NOT NULL 
  AND "travellerFirstName" != '';

-- 2. Drop the legacy columns
-- Only dropping the name columns as requested, but keeping others for now unless explicitly asked, 
-- or we can drop them all to be clean. The user said "remove the column travellerFirstName and travellerLastName".
ALTER TABLE bookings DROP COLUMN IF EXISTS "travellerFirstName";
ALTER TABLE bookings DROP COLUMN IF EXISTS "travellerLastName";

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
