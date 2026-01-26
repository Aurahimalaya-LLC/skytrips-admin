-- Function to get authentication identities for a customer
-- This allows admins to see which providers (Google, Email, etc.) a customer uses
CREATE OR REPLACE FUNCTION public.get_customer_identities(p_customer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id UUID;
  v_identities JSONB;
BEGIN
  -- 1. Get the auth_user_id associated with this customer
  SELECT auth_user_id INTO v_auth_id
  FROM public.customers
  WHERE id = p_customer_id;

  -- If no auth user is linked, return empty array
  IF v_auth_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- 2. Fetch identities from the auth.identities table
  -- We aggregate them into a JSON array
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'provider', provider,
      'created_at', created_at,
      'last_sign_in_at', last_sign_in_at,
      'email', (identity_data->>'email')
    )
  ) INTO v_identities
  FROM auth.identities
  WHERE user_id = v_auth_id;

  RETURN COALESCE(v_identities, '[]'::jsonb);
END;
$$;
