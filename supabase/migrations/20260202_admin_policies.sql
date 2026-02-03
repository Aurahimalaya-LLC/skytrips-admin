-- Helper Function to check Admin status (Security Definer to bypass RLS on user_roles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 1. BOOKINGS TABLE
-- ==========================================
-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add Admin Policy
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ==========================================
-- 2. PAYMENTS TABLE
-- ==========================================
-- Ensure RLS is enabled
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Add Admin Policy
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add User Policy (View Own Payments via Bookings)
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN customers c ON b.customerid = c.id
      WHERE b.id = payments.booking_id
      AND c.auth_user_id = auth.uid()
    )
  );

-- ==========================================
-- 3. CUSTOMERS TABLE
-- ==========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add Admin Policy
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ==========================================
-- 4. AGENCIES TABLE
-- ==========================================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Add Admin Policy
DROP POLICY IF EXISTS "Admins can view all agencies" ON agencies;
CREATE POLICY "Admins can view all agencies" ON agencies
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ==========================================
-- 5. USER ROLES TABLE
-- ==========================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own role (optional if we use is_admin function, but good for frontend checks)
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow Service Role to manage roles (already exists in setup, but reinforcing)
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;
CREATE POLICY "Service role can manage roles" ON user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
