-- 1. Add auth_user_id to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id);

-- 2. Link Travellers to Customers
ALTER TABLE travellers
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_travellers_customer_id ON travellers(customer_id);

-- 3. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_customer_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_customer_id UUID;
BEGIN
  -- Check if a customer with this email already exists
  SELECT id INTO existing_customer_id
  FROM public.customers
  WHERE email = NEW.email
  LIMIT 1;

  IF existing_customer_id IS NOT NULL THEN
    -- Link existing customer to the new auth user
    UPDATE public.customers
    SET auth_user_id = NEW.id
    WHERE id = existing_customer_id;
  ELSE
    -- Create a new customer record
    INSERT INTO public.customers (email, "firstName", "lastName")
    VALUES (
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'firstName', 'New'),
      COALESCE(NEW.raw_user_meta_data->>'lastName', 'Customer')
    );
    -- Update the record to link auth_id (explicit update to be safe)
    UPDATE public.customers
    SET auth_user_id = NEW.id
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer_user();

-- 5. RLS Policies

-- Customers Table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own profile" ON customers;
CREATE POLICY "Customers can view own profile" ON customers
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update own profile" ON customers;
CREATE POLICY "Customers can update own profile" ON customers
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Bookings Table (Update policies to use auth_user_id for stricter security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
CREATE POLICY "Customers can view own bookings" ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customerid IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can insert own bookings" ON bookings;
CREATE POLICY "Customers can insert own bookings" ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customerid IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings;
CREATE POLICY "Customers can update own bookings" ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    customerid IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Travellers Table
ALTER TABLE travellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own travellers" ON travellers;
CREATE POLICY "Customers can view own travellers" ON travellers
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can manage own travellers" ON travellers;
CREATE POLICY "Customers can manage own travellers" ON travellers
  FOR ALL
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- 6. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
