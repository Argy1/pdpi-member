-- Fix all registration issues in one migration
-- Problem 1: handle_new_user() has TEXT type mismatch with app_role enum
-- Problem 2: sync_profile_role_to_user_roles() has redundant cast

-- Fix 1: Update handle_new_user() to properly cast TEXT to app_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- Insert into profiles with role from metadata
  -- FIXED: Cast TEXT to app_role enum
  INSERT INTO public.profiles (user_id, role, branch_id)
  VALUES (
    NEW.id,
    user_role::app_role,  -- Cast to enum type
    (NEW.raw_user_meta_data->>'pd_id')::uuid
  );
  
  RETURN NEW;
END;
$function$;

-- Fix 2: Clean up sync_profile_role_to_user_roles() - remove redundant cast
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Delete existing role for this user
  DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
  
  -- Insert new role based on profile
  -- FIXED: No need to cast, NEW.role is already app_role type
  IF NEW.role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;