-- ==========================================
-- 1. CLEANUP & PREPARATION
-- ==========================================

-- Drop dependent views to avoid schema change errors
DROP VIEW IF EXISTS view_customer_payments;
DROP VIEW IF EXISTS view_agency_payments;
DROP VIEW IF EXISTS view_unified_payments;

-- ==========================================
-- 2. ADMIN PERMISSIONS SETUP
-- ==========================================

-- Helper Function to check Admin status
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

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- ==========================================
-- 3. RLS POLICIES (Allow Admins to See Everything)
-- ==========================================

-- BOOKINGS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT TO authenticated USING (is_admin());

-- PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT TO authenticated USING (is_admin());

-- CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers" ON customers FOR SELECT TO authenticated USING (is_admin());

-- AGENCIES
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all agencies" ON agencies;
CREATE POLICY "Admins can view all agencies" ON agencies FOR SELECT TO authenticated USING (is_admin());

-- USER ROLES
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ==========================================
-- 4. RECREATE VIEWS (With Security Invoker)
-- ==========================================

-- View: Unified Payments
CREATE OR REPLACE VIEW view_unified_payments WITH (security_invoker = true) AS
SELECT 
    p.payment_id,
    b.id AS booking_id,
    b.created_at AS created_date,
    COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS customer_name,
    COALESCE(b."sellingPrice"::NUMERIC, b.sellingprice::NUMERIC, 0) AS selling_price,
    p.payment_status AS status,
    p.amount,
    p.payment_date,
    a.agency_name,
    COALESCE(a.contact_phone, a.number) AS cp,
    a.contact_person,
    CASE 
        WHEN b.agency_id IS NOT NULL THEN 'Agency'
        ELSE 'Customer'
    END AS payment_source,
    b.travellers AS travellers_json
FROM 
    public.payments p
JOIN 
    public.bookings b ON p.booking_id = b.id
LEFT JOIN 
    public.agencies a ON b.agency_id = a.uid
LEFT JOIN 
    public.customers c ON b.customerid = c.id;

-- View: Customer Payments
CREATE OR REPLACE VIEW view_customer_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Customer';

-- View: Agency Payments
CREATE OR REPLACE VIEW view_agency_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Agency';
