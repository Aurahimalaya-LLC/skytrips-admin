-- Migration: Payment System Schema Design
-- Description: Implements customers, agencies, bookings, and payments relationships.

-- 1. Bookings Table Updates
-- Ensure agency_id exists for linking agencies
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(uid);

-- 2. Payments Table Creation
-- Note: booking_id is BIGINT to match public.bookings(id)
CREATE TABLE IF NOT EXISTS public.payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    payment_date TIMESTAMPTZ DEFAULT now(),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON public.bookings(agency_id);

-- 3. Views for Efficient Data Retrieval

-- DROP DEPENDENT VIEWS FIRST to avoid "cannot change data type of view column" errors
DROP VIEW IF EXISTS view_customer_payments;
DROP VIEW IF EXISTS view_agency_payments;
DROP VIEW IF EXISTS view_unified_payments;

-- View: Unified Payments (Customer & Agency)
CREATE OR REPLACE VIEW view_unified_payments WITH (security_invoker = true) AS
SELECT 
    p.payment_id,
    b.id AS booking_id,
    b.created_at AS created_date,
    -- Concat name or fallback to email
    COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS customer_name,
    -- Prioritize sellingPrice, then sellingprice, then 0
    COALESCE(b."sellingPrice"::NUMERIC, b.sellingprice::NUMERIC, 0) AS selling_price,
    p.payment_status AS status,
    p.amount,
    p.payment_date,
    
    -- Agency Details (Nullable)
    a.agency_name,
    COALESCE(a.contact_phone, a.number) AS cp, -- Contact Phone
    a.contact_person,
    
    -- Derived Column to distinguish source
    CASE 
        WHEN b.agency_id IS NOT NULL THEN 'Agency'
        ELSE 'Customer'
    END AS payment_source,

    -- Travellers Data
    b.travellers AS travellers_json

FROM 
    public.payments p
JOIN 
    public.bookings b ON p.booking_id = b.id
LEFT JOIN 
    public.agencies a ON b.agency_id = a.uid
LEFT JOIN 
    public.customers c ON b.customerid = c.id;

-- RESTORED LEGACY VIEWS (As Wrappers)

-- View: Customer Payments (Legacy Wrapper)
CREATE OR REPLACE VIEW view_customer_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Customer';

-- View: Agency Payments (Legacy Wrapper)
CREATE OR REPLACE VIEW view_agency_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Agency';


-- 4. Unified Contacts View (Customers & Agencies)
CREATE OR REPLACE VIEW view_unified_contacts AS
SELECT
    id AS entity_id,
    COALESCE("firstName" || ' ' || "lastName", email) AS name,
    email,
    phone,
    address::TEXT,
    'Customer' AS type,
    created_at
FROM
    public.customers

UNION ALL

SELECT
    uid AS entity_id,
    agency_name AS name,
    contact_email AS email,
    COALESCE(contact_phone, number) AS phone,
    COALESCE(address_line1 || ' ' || city, address_line1) AS address,
    'Agency' AS type,
    created_at
FROM
    public.agencies;


-- 5. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
