-- 1. Create/Update Settings Table (Fixed syntax)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  company_email TEXT,
  company_phone TEXT,
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  notifications BOOLEAN DEFAULT true,
  logo_url TEXT,
  favicon_url TEXT,
  company_profiles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add travelDate column to bookings table (Your primary request)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "travelDate" text;

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
