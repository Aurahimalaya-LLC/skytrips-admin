-- Fix for missing columns required by views
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paymentmethod TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paymentstatus TEXT;

-- Also ensure other potential missing columns from the error log are there
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "tripType" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "flightClass" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "departureDate" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "returnDate" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "PNR" TEXT;

-- AIRPORTS & AIRLINES iata_code
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS iata_code TEXT;
ALTER TABLE public.airlines ADD COLUMN IF NOT EXISTS iata_code TEXT;

-- Handle case where 'code' was used instead of 'iata_code'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'airports' AND column_name = 'code') THEN
        UPDATE public.airports SET iata_code = code WHERE iata_code IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'airlines' AND column_name = 'code') THEN
        UPDATE public.airlines SET iata_code = code WHERE iata_code IS NULL;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
