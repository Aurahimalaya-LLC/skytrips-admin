-- Robust migration to backfill departure/return dates from potential CSV import columns
-- This handles cases where data might be in 'Departure Date', 'Return Date', or 'travelDate'.

DO $$
BEGIN
  -- 1. Try to copy from "Departure Date" (common CSV header) if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'Departure Date') THEN
    EXECUTE 'UPDATE public.bookings SET "departureDate" = "Departure Date" WHERE "departureDate" IS NULL';
  END IF;

  -- 2. Try to copy from "Return Date" (common CSV header) if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'Return Date') THEN
    EXECUTE 'UPDATE public.bookings SET "returnDate" = "Return Date" WHERE "returnDate" IS NULL';
  END IF;

  -- 3. Fallback: Copy from "travelDate" (legacy column) to "departureDate"
  UPDATE public.bookings 
  SET "departureDate" = "travelDate" 
  WHERE "departureDate" IS NULL AND "travelDate" IS NOT NULL;

  -- 4. Fallback: If "arrivalDate" exists and "returnDate" is empty, maybe use that? 
  -- (Use caution here, but often arrival of return leg is stored in arrivalDate for simple imports)
  -- Uncomment below if desired:
  -- UPDATE public.bookings SET "returnDate" = "arrivalDate" WHERE "returnDate" IS NULL AND "arrivalDate" IS NOT NULL;

END $$;

NOTIFY pgrst, 'reload schema';
