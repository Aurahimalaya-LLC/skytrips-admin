-- 1. Add the 'travellers' column 
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS travellers JSONB DEFAULT '[]'::jsonb NOT NULL; 

-- 2. Add 'customer' column to store full snapshot of customer info
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer JSONB DEFAULT '{}'::jsonb;

-- 3. Add descriptions
COMMENT ON COLUMN bookings.travellers IS 'Array of traveller details for the booking'; 
COMMENT ON COLUMN bookings.customer IS 'Snapshot of full customer details (email, phone, address) at time of booking';

-- 4. Refresh the API Schema (Fixes PGRST204 error) 
NOTIFY pgrst, 'reload schema'; 

-- 5. Enable RLS on bookings table (if not already enabled) 
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY; 

-- 6. Add index on customerid for performance 
CREATE INDEX IF NOT EXISTS idx_bookings_customerid ON bookings(customerid); 

-- 7. Create policy to allow users to view their own bookings 
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings; 

CREATE POLICY "Customers can view own bookings" ON bookings 
FOR SELECT 
TO authenticated 
USING ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
); 

-- 8. Create policy to allow users to insert their own bookings 
DROP POLICY IF EXISTS "Customers can insert own bookings" ON bookings; 

CREATE POLICY "Customers can insert own bookings" ON bookings 
FOR INSERT 
TO authenticated 
WITH CHECK ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
); 

-- 9. Create policy to allow users to update their own bookings 
DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings; 

CREATE POLICY "Customers can update own bookings" ON bookings 
FOR UPDATE 
TO authenticated 
USING ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
) 
WITH CHECK ( 
  customerid IN ( 
    SELECT id FROM customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  ) 
);
