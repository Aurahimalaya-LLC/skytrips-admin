-- Migration to structure route_info JSONB column and add validation
-- 1. Ensure route_info exists and is JSONB
-- 2. Migrate data from top-level columns (if they exist) to route_info
-- 3. Add validation trigger

-- Ensure route_info exists
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS route_info JSONB DEFAULT '{}'::jsonb;

-- Migrate data from top-level columns if they exist (from previous migration)
-- We use COALESCE to keep existing route_info data if present
UPDATE routes
SET route_info = route_info || jsonb_build_object(
    'average_flight_time', COALESCE(average_flight_time, route_info->>'average_flight_time'),
    'distance', COALESCE(distance, route_info->>'distance'),
    'cheapest_month', COALESCE(cheapest_month, route_info->>'cheapest_month'),
    'daily_flights', COALESCE(daily_flights::text::int, (route_info->>'daily_flights')::int, 0)
)
WHERE average_flight_time IS NOT NULL 
   OR distance IS NOT NULL 
   OR cheapest_month IS NOT NULL 
   OR daily_flights IS NOT NULL;

-- Drop top-level columns if they exist (cleanup)
ALTER TABLE routes DROP COLUMN IF EXISTS average_flight_time;
ALTER TABLE routes DROP COLUMN IF EXISTS distance;
ALTER TABLE routes DROP COLUMN IF EXISTS cheapest_month;
ALTER TABLE routes DROP COLUMN IF EXISTS daily_flights;

-- Create Validation Function
CREATE OR REPLACE FUNCTION validate_route_info()
RETURNS TRIGGER AS $$
DECLARE
    info jsonb := NEW.route_info;
    avg_time text;
    dist text;
    month text;
    flights int;
BEGIN
    -- Allow NULL route_info, but if present, must be object
    IF info IS NULL THEN
        RETURN NEW;
    END IF;

    -- Extract values
    avg_time := info->>'average_flight_time';
    dist := info->>'distance';
    month := info->>'cheapest_month';
    
    -- Handle daily_flights safely (cast to int)
    BEGIN
        flights := (info->>'daily_flights')::int;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'daily_flights must be an integer';
    END;

    -- 1. Validate average_flight_time (HH:MM or ISO-8601)
    -- Simple regex for HH:MM or P... (ISO duration starts with P)
    IF avg_time IS NOT NULL AND NOT (avg_time ~ '^\d{1,2}:\d{2}$' OR avg_time ~ '^P') THEN
        RAISE EXCEPTION 'average_flight_time must be HH:MM or ISO-8601 duration';
    END IF;

    -- 2. Validate distance (e.g., "1 234 km" or "765 mi")
    IF dist IS NOT NULL AND NOT dist ~ '^\d+([\s,]\d+)*\s?(km|mi)$' THEN
        RAISE EXCEPTION 'distance must be format like "1 234 km" or "765 mi"';
    END IF;

    -- 3. Validate cheapest_month (Full name or 3-letter abbr)
    IF month IS NOT NULL AND NOT month ~* '^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$' THEN
        -- Check constraint mentioned checking for valid month names.
        -- We allow comma separated? The previous code supported multiple months. 
        -- The prompt implies singular "cheapest_month". 
        -- If the user wants multiple, the regex needs to be more complex.
        -- "store the month (full name or three-letter abbreviation)" implies singular.
        -- However, previous frontend code supported multiple. Let's stick to singular validation for now as per prompt.
        RAISE EXCEPTION 'cheapest_month must be a valid month name or abbreviation';
    END IF;

    -- 4. Validate daily_flights (>= 0)
    IF flights IS NOT NULL AND flights < 0 THEN
        RAISE EXCEPTION 'daily_flights must be non-negative';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trg_validate_route_info ON routes;
CREATE TRIGGER trg_validate_route_info
BEFORE INSERT OR UPDATE ON routes
FOR EACH ROW
EXECUTE FUNCTION validate_route_info();

-- Backfill placeholder (flight_schedule and pricing tables do not exist)
-- If they did, we would do:
-- UPDATE routes r SET route_info = ... FROM flight_schedule fs WHERE r.id = fs.route_id ...

NOTIFY pgrst, 'reload schema';
