-- Function to allow a user to claim their customer profile based on email
-- This helps in cases where the trigger failed or for existing users
CREATE OR REPLACE FUNCTION public.claim_customer_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  curr_user_id uuid;
  curr_user_email text;
  curr_user_meta jsonb;
  customer_record record;
BEGIN
  -- Get current auth user details
  curr_user_id := auth.uid();
  SELECT email, raw_user_meta_data INTO curr_user_email, curr_user_meta 
  FROM auth.users 
  WHERE id = curr_user_id;

  IF curr_user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found';
  END IF;

  -- 1. Try to find existing customer by email
  SELECT * INTO customer_record FROM public.customers WHERE email = curr_user_email LIMIT 1;

  IF customer_record.id IS NOT NULL THEN
    -- Customer exists
    IF customer_record.auth_user_id IS NULL THEN
       -- Link it
       UPDATE public.customers
       SET auth_user_id = curr_user_id
       WHERE id = customer_record.id;
       RETURN jsonb_build_object('status', 'linked', 'id', customer_record.id);
    ELSIF customer_record.auth_user_id = curr_user_id THEN
       -- Already linked correctly
       RETURN jsonb_build_object('status', 'exists', 'id', customer_record.id);
    ELSE
       -- Linked to someone else? (Should not happen if email is unique)
       RAISE EXCEPTION 'Profile already linked to another user';
    END IF;
  ELSE
    -- 2. Customer does not exist, create new
    INSERT INTO public.customers (email, "firstName", "lastName", auth_user_id)
    VALUES (
      curr_user_email,
      COALESCE(curr_user_meta->>'firstName', 'New'),
      COALESCE(curr_user_meta->>'lastName', 'Customer'),
      curr_user_id
    )
    RETURNING id INTO customer_record.id;
    
    RETURN jsonb_build_object('status', 'created', 'id', customer_record.id);
  END IF;
END;
$$;
