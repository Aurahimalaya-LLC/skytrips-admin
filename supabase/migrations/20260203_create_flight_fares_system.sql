-- Create flight_fares table
CREATE TABLE IF NOT EXISTS flight_fares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    departure_airport_code TEXT NOT NULL,
    arrival_airport_code TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    airline_code TEXT NOT NULL,
    fare_class TEXT NOT NULL, -- e.g., Economy, Business, First
    base_price NUMERIC(10, 2) NOT NULL,
    taxes NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) GENERATED ALWAYS AS (base_price + taxes) STORED,
    availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Sold Out', 'Cancelled', 'Expired')),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    version INTEGER DEFAULT 1, -- For optimistic locking
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE flight_fares ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust based on actual role requirements, allowing public read for now for demonstration)
CREATE POLICY "Public read access" ON flight_fares FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON flight_fares FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON flight_fares FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON flight_fares FOR DELETE USING (auth.role() = 'authenticated');


-- Create flight_fare_audit_logs table
CREATE TABLE IF NOT EXISTS flight_fare_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fare_id UUID REFERENCES flight_fares(id) ON DELETE CASCADE,
    operation TEXT NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for audit logs
ALTER TABLE flight_fare_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON flight_fare_audit_logs FOR SELECT USING (auth.role() = 'authenticated');


-- Function to handle optimistic locking and audit logging
CREATE OR REPLACE FUNCTION handle_flight_fare_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Optimistic Locking Check
    IF OLD.version IS DISTINCT FROM NEW.version - 1 THEN
        RAISE EXCEPTION 'Concurrent update detected. Expected version %, but got %', OLD.version + 1, NEW.version;
    END IF;

    -- Audit Logging
    INSERT INTO flight_fare_audit_logs (fare_id, operation, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Update
CREATE TRIGGER flight_fare_update_trigger
BEFORE UPDATE ON flight_fares
FOR EACH ROW
EXECUTE FUNCTION handle_flight_fare_update();


-- Function to handle audit logging for Insert
CREATE OR REPLACE FUNCTION handle_flight_fare_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO flight_fare_audit_logs (fare_id, operation, new_data, changed_by)
    VALUES (NEW.id, 'CREATE', to_jsonb(NEW), auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Insert
CREATE TRIGGER flight_fare_insert_trigger
AFTER INSERT ON flight_fares
FOR EACH ROW
EXECUTE FUNCTION handle_flight_fare_insert();

-- Function to handle audit logging for Delete
CREATE OR REPLACE FUNCTION handle_flight_fare_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO flight_fare_audit_logs (fare_id, operation, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Delete
CREATE TRIGGER flight_fare_delete_trigger
AFTER DELETE ON flight_fares
FOR EACH ROW
EXECUTE FUNCTION handle_flight_fare_delete();

-- Indexing for performance
CREATE INDEX idx_flight_fares_route ON flight_fares(departure_airport_code, arrival_airport_code);
CREATE INDEX idx_flight_fares_dates ON flight_fares(departure_time);
CREATE INDEX idx_flight_fares_airline ON flight_fares(airline_code);
CREATE INDEX idx_flight_fares_price ON flight_fares(total_price);
