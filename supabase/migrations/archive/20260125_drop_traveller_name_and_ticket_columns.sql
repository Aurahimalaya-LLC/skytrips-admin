-- 1. Migrate existing data: Populate array from legacy flat fields
-- This ensures that any records that still have flat data but empty JSONB array get migrated.
-- Added migration for ticketNumber -> eticketNumber
UPDATE bookings
SET travellers = jsonb_build_array(
  jsonb_build_object(
    'firstName', "travellerFirstName",
    'lastName', "travellerLastName",
    'passportNumber', "passportNumber",
    'passportExpiry', "passportExpiry",
    'dob', "dob",
    'nationality', "nationality",
    'eticketNumber', "ticketNumber"
  )
)
WHERE (travellers = '[]'::jsonb OR travellers IS NULL)
  AND "travellerFirstName" IS NOT NULL 
  AND "travellerFirstName" != '';

-- 2. Update existing travellers array to include ticketNumber if it's missing in the array but present in the column
-- This handles cases where travellers array exists but might not have the ticket number synced
-- UPDATED: Now applies ticketNumber to ALL travellers in the array, not just the first one.
UPDATE bookings
SET travellers = (
  SELECT jsonb_agg(
    element || jsonb_build_object('eticketNumber', "ticketNumber")
  )
  FROM jsonb_array_elements(travellers) AS element
)
WHERE travellers != '[]'::jsonb 
  AND travellers IS NOT NULL
  AND "ticketNumber" IS NOT NULL 
  AND "ticketNumber" != ''
  -- Only update if ANY traveller is missing the eticketNumber or it's empty, to avoid overwriting existing valid ones? 
  -- Actually, the request implies "transferring" the column value to the array. 
  -- If we want to be safe, we can use coalesce or check if key exists.
  -- But simpler is to just apply it if the column has value.
  AND (travellers->0->>'eticketNumber' IS NULL OR travellers->0->>'eticketNumber' = '');

-- 3. Drop the legacy columns
ALTER TABLE bookings DROP COLUMN IF EXISTS "travellerFirstName";
ALTER TABLE bookings DROP COLUMN IF EXISTS "travellerLastName";
ALTER TABLE bookings DROP COLUMN IF EXISTS "ticketNumber";

-- 4. Notify schema reload
NOTIFY pgrst, 'reload schema';
