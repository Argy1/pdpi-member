-- Fix duplicate insert issue in handle_new_user trigger
-- The sync_profile_role_to_user_roles trigger already handles user_roles insert

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- Insert into profiles with role from metadata
  -- The sync_profile_role_to_user_roles trigger will automatically
  -- insert into user_roles table, so we don't do it here
  INSERT INTO public.profiles (user_id, role, branch_id)
  VALUES (
    NEW.id,
    user_role,
    (NEW.raw_user_meta_data->>'pd_id')::uuid
  );
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();