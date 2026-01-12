-- Schema Migration for Enhanced Customer Profile
-- Based on JSON analysis and field mapping requirements

-- 1. Create enum types for standardized fields if they don't exist
DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('Active', 'Inactive', 'Pending', 'Suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other', 'Prefer not to say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance customers table with new fields
ALTER TABLE customers
    -- Add preferences JSONB column for flexible user settings
    ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Add loyalty program details
    ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(50) DEFAULT 'Blue',
    ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
    
    -- Add metadata for tracking source and last update
    ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web',
    ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45),
    
    -- Add preferred language and currency
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Add marketing consent flags
    ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false;

-- 3. Add constraints and validations
ALTER TABLE customers
    -- Ensure email format
    ADD CONSTRAINT email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    
    -- Ensure phone format (basic check)
    ADD CONSTRAINT phone_format_check 
    CHECK (phone ~* '^\+?[0-9\-\s()]+$'),
    
    -- Ensure loyalty points are non-negative
    ADD CONSTRAINT positive_loyalty_points 
    CHECK (loyalty_points >= 0);

-- 4. Create indexes for frequently searched fields
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_tier ON customers(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- 5. Comment on columns for documentation
COMMENT ON COLUMN customers.preferences IS 'Stores user preferences like notification settings, dietary requirements etc.';
COMMENT ON COLUMN customers.loyalty_tier IS 'Current tier in the loyalty program (Blue, Silver, Gold, Platinum)';
COMMENT ON COLUMN customers.marketing_consent IS 'Whether user has opted in for marketing communications';
