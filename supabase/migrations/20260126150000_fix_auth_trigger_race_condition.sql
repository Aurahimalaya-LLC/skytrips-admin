-- 1. Redefine the function with robust error handling and case insensitivity
CREATE OR REPLACE FUNCTION public.handle_new_customer_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_customer_id UUID;
BEGIN
  -- Check if a customer with this email already exists (Case Insensitive and Trimmed)
  SELECT id INTO existing_customer_id
  FROM public.customers
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  LIMIT 1;

  IF existing_customer_id IS NOT NULL THEN
    -- Link existing customer to the new auth user
    BEGIN
      UPDATE public.customers
      SET auth_user_id = NEW.id
      WHERE id = existing_customer_id;
    EXCEPTION WHEN unique_violation THEN
      -- If updating causes a conflict (rare), log it but don't break the signup
      RAISE WARNING 'Duplicate key error when updating existing customer: %', SQLERRM;
    END;
  ELSE
    -- Create a new customer record
    BEGIN
      INSERT INTO public.customers (email, "firstName", "lastName", auth_user_id)
      VALUES (
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'lastName', 'Customer'),
        NEW.id
      );
    EXCEPTION WHEN unique_violation THEN
      -- Handle Race Condition: If INSERT fails, it means the user exists. Update instead.
      SELECT id INTO existing_customer_id
      FROM public.customers
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
      LIMIT 1;
      
      IF existing_customer_id IS NOT NULL THEN
         UPDATE public.customers
         SET auth_user_id = NEW.id
         WHERE id = existing_customer_id;
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Manual Fix: Attempt to link the specific failing users if they are stuck
DO $$
DECLARE
  v_user_email text;
  v_auth_id uuid;
BEGIN
  -- Fix for krishna@aurahimalaya.org
  v_user_email := 'krishna@aurahimalaya.org';
  SELECT id INTO v_auth_id FROM auth.users WHERE email = v_user_email;
  
  IF v_auth_id IS NOT NULL THEN
    UPDATE public.customers 
    SET auth_user_id = v_auth_id 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(v_user_email)) 
    AND (auth_user_id IS NULL OR auth_user_id != v_auth_id);
  END IF;

  -- Fix for krsna@skytrips.com.au
  v_user_email := 'krsna@skytrips.com.au';
  SELECT id INTO v_auth_id FROM auth.users WHERE email = v_user_email;
  
  IF v_auth_id IS NOT NULL THEN
    UPDATE public.customers 
    SET auth_user_id = v_auth_id 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(v_user_email))
    AND (auth_user_id IS NULL OR auth_user_id != v_auth_id);
  END IF;
END $$;
