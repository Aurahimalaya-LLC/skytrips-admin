-- View: Booking Payments Details
-- Description: Comprehensive view joining bookings, payments, customers, and agencies for detailed reporting.

CREATE OR REPLACE VIEW view_booking_payments_details AS
SELECT
    -- Booking Information
    b.id AS booking_id,
    b.created_at AS booking_created_at,
    b.status AS booking_status,
    b."tripType" AS trip_type,
    b."flightClass" AS flight_class,
    b.airlines,
    b.origin,
    b.destination,
    b."departureDate" AS departure_date,
    b."returnDate" AS return_date,
    b."PNR" AS pnr,
    
    -- Financials (Booking Level)
    -- Handle case sensitivity for legacy columns
    COALESCE(
        (b."sellingPrice"::text)::numeric, 
        (b.sellingprice::text)::numeric, 
        0
    ) AS total_booking_amount,
    b.currency,
    COALESCE(b."paymentMethod", b.paymentmethod) AS booking_payment_method,
    COALESCE(b."paymentStatus", b.paymentstatus) AS booking_payment_status,

    -- Customer Information
    c.id AS customer_id,
    COALESCE(c."firstName", '') AS customer_first_name,
    COALESCE(c."lastName", '') AS customer_last_name,
    COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    
    -- Payment Record (One-to-Many potential, represented as row per payment)
    p.payment_id,
    p.amount AS payment_amount,
    p.payment_status AS payment_record_status,
    p.payment_date,
    p.created_at AS payment_record_created_at,
    
    -- Agency Information (if applicable)
    b.agency_id,
    a.agency_name

FROM
    public.bookings b
LEFT JOIN
    public.payments p ON b.id = p.booking_id
LEFT JOIN
    public.customers c ON b.customerid = c.id
LEFT JOIN
    public.agencies a ON b.agency_id = a.uid;

-- Grant access to authenticated users
GRANT SELECT ON view_booking_payments_details TO authenticated;
GRANT SELECT ON view_booking_payments_details TO service_role;

-- Comment on view
COMMENT ON VIEW view_booking_payments_details IS 'Comprehensive view joining bookings, payments, customers, and agencies for detailed payment analysis.';
