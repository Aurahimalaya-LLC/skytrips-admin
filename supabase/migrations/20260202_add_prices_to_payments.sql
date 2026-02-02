-- Migration: Add CP and SP columns to Payments table
-- Description: Adds cost_price and selling_price to the payments table for dynamic financials.

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2);

-- Update view to include new columns
CREATE OR REPLACE VIEW view_unified_payments AS
SELECT 
    p.payment_id,
    b.id AS booking_id,
    b.created_at AS created_date,
    COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS customer_name,
    p.selling_price, -- Use payment level selling_price
    p.cost_price,    -- Use payment level cost_price
    p.payment_status AS status,
    p.amount,
    p.payment_date,
    a.agency_name,
    COALESCE(a.contact_phone, a.number) AS cp,
    a.contact_person,
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

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
