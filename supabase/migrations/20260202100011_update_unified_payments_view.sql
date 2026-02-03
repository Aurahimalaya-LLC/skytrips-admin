-- Migration: Update Unified Payments View to include Booking ID and handle JSON customer data
-- Description: Ensures customer_name is populated even if customerid is null, using the JSON customer column.
DROP VIEW IF EXISTS view_customer_payments;
DROP VIEW IF EXISTS view_agency_payments;
DROP VIEW IF EXISTS view_unified_payments;

CREATE OR REPLACE VIEW view_unified_payments AS
SELECT 
    p.payment_id,
    b.id AS booking_id,
    b.created_at AS created_date,
    -- Handle customer name from multiple sources
    COALESCE(
        -- 1. Try Joined Customers table
        c."firstName" || ' ' || c."lastName",
        -- 2. Try JSON customer column in bookings
        (b.customer->>'firstName') || ' ' || (b.customer->>'lastName'),
        -- 3. Try Travellers list (first traveller)
        (b.travellers->0->>'firstName') || ' ' || (b.travellers->0->>'lastName'),
        -- 4. Fallback to emails
        c.email,
        b.customer->>'email',
        'N/A'
    ) AS customer_name,
    p.selling_price,
    p.cost_price,
    p.payment_status AS status,
    p.amount,
    p.payment_date,
    a.agency_name,
    COALESCE(a.contact_phone, a.number) AS cp,
    a.contact_person,
    -- Include raw data for fallback
    b.customer AS customer_json,
    b.travellers AS travellers_json,
    CASE 
        WHEN b.agency_id IS NOT NULL THEN 'Agency'
        ELSE 'Customer'
    END AS payment_source
FROM 
    public.payments p
JOIN 
    public.bookings b ON p.booking_id = b.id
LEFT JOIN 
    public.agencies a ON b.agency_id = a.uid
LEFT JOIN 
    public.customers c ON b.customerid = c.id;

-- Recreate dependent views
CREATE OR REPLACE VIEW view_customer_payments AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Customer';

CREATE OR REPLACE VIEW view_agency_payments AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Agency';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
