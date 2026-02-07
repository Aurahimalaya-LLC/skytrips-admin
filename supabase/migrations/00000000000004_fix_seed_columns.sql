-- Ensure columns for seeding exist
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "travellerLastName" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "travellerFirstName" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "PNR" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "ticketNumber" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "airlines" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "origin" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "transit" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "destination" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "tripType" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "bookingstatus" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "issueMonth" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "IssueDay" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "issueYear" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "departureDate" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "returnDate" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "buyingPrice" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "sellingprice" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "paymentstatus" TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "issuedthroughagency" TEXT;

NOTIFY pgrst, 'reload schema';
