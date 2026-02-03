DROP VIEW IF EXISTS view_customer_payments;
DROP VIEW IF EXISTS view_agency_payments;
DROP VIEW IF EXISTS view_unified_payments;

CREATE OR REPLACE VIEW view_unified_payments WITH (security_invoker = true) AS
SELECT 
    p.payment_id,
    b.id AS booking_id,
    b.created_at AS created_date,
    COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS customer_name,
    COALESCE(p.selling_price, b."sellingPrice"::NUMERIC, b.sellingprice::NUMERIC, 0) AS selling_price,
    COALESCE(p.cost_price, b."buyingPrice"::NUMERIC, b.buyingprice::NUMERIC, 0) AS cost_price,
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

CREATE OR REPLACE VIEW view_customer_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Customer';

CREATE OR REPLACE VIEW view_agency_payments WITH (security_invoker = true) AS
SELECT * FROM view_unified_payments WHERE payment_source = 'Agency';
