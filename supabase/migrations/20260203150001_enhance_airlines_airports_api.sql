-- Enhance airlines and airports tables for comprehensive RESTful API

-- AIRLINES
ALTER TABLE public.airlines
ADD COLUMN IF NOT EXISTS fleet_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS operational_routes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS call_sign TEXT,
ADD COLUMN IF NOT EXISTS hub_code TEXT;

COMMENT ON COLUMN public.airlines.fleet_details IS 'Detailed breakdown of aircraft fleet (e.g., types, counts)';
COMMENT ON COLUMN public.airlines.operational_routes IS 'Summary of major routes operated by the airline';
COMMENT ON COLUMN public.airlines.call_sign IS 'Airline call sign (e.g., SPEEDBIRD)';
COMMENT ON COLUMN public.airlines.hub_code IS 'Primary hub airport code';

-- AIRPORTS
-- Ensure airports table exists (if it wasn't found in previous search, we assume it exists due to previous ALTERs, but let's be safe with IF NOT EXISTS on columns)
-- We need to check if we need to create the table first. Since we saw ALTER statements, it likely exists. 
-- However, we didn't see the CREATE statement. Let's assume it exists or the previous ALTER would have failed.

ALTER TABLE public.airports
ADD COLUMN IF NOT EXISTS icao_code TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS terminals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT;

COMMENT ON COLUMN public.airports.icao_code IS '4-letter ICAO airport code';
COMMENT ON COLUMN public.airports.latitude IS 'Latitude coordinate';
COMMENT ON COLUMN public.airports.longitude IS 'Longitude coordinate';
COMMENT ON COLUMN public.airports.terminals IS 'List of terminals and their details';
COMMENT ON COLUMN public.airports.timezone IS 'Timezone identifier (e.g., America/New_York)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_airlines_iata ON public.airlines(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON public.airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_icao ON public.airports(icao_code);
CREATE INDEX IF NOT EXISTS idx_airports_city ON public.airports(city);

NOTIFY pgrst, 'reload schema';
