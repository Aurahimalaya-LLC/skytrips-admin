-- 1. Insert all existing users as admins into user_roles
-- This ensures that whoever is logged in will have admin access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- 2. Verify the function is accessible
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 3. Ensure public.user_roles is readable by the is_admin function (SECURITY DEFINER handles this, but good to be sure)
-- (No extra grant needed for SECURITY DEFINER functions usually, but we ensure the table exists)

-- 4. Just in case, grant usage on schema public to authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
