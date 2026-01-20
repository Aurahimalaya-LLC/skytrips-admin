
-- Add missing columns to manage_booking table for Refund/Reissue workflows
ALTER TABLE manage_booking 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Refund',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS amount NUMERIC,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS booking_details JSONB;

-- Update RLS policies if needed to allow access to new columns (usually automatic for owners)
-- Ensure authenticated users can read/insert
DROP POLICY IF EXISTS "Enable read access for all users" ON manage_booking;
CREATE POLICY "Enable read access for all users" ON manage_booking FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON manage_booking;
CREATE POLICY "Enable insert for authenticated users" ON manage_booking FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for users based on uid" ON manage_booking;
CREATE POLICY "Enable update for users based on uid" ON manage_booking FOR UPDATE USING (auth.uid() = user_id);
