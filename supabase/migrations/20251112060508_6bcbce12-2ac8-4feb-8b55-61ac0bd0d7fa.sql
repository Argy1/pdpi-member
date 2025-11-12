-- Fix handle_new_user trigger to respect user metadata role
-- This prevents duplicate key errors during registration

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'app_role')::app_role,
    'user'::app_role
  );
  
  -- Insert into profiles with role from metadata
  INSERT INTO public.profiles (user_id, role, branch_id)
  VALUES (
    NEW.id,
    user_role::text,
    (NEW.raw_user_meta_data->>'pd_id')::uuid
  );
  
  -- Insert into user_roles (will be synced by trigger)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();