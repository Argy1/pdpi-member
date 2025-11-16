-- Drop and recreate handle_new_user trigger with NIK validation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function with NIK validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
  user_nik TEXT;
  member_exists BOOLEAN;
BEGIN
  -- Get NIK from user metadata
  user_nik := NEW.raw_user_meta_data->>'nik';
  
  -- CRITICAL: Validate NIK exists in members table for regular users
  -- Only bypass this check for admin roles
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- For regular users, NIK MUST exist in members table
  IF user_role = 'user' THEN
    IF user_nik IS NULL OR user_nik = '' THEN
      RAISE EXCEPTION 'NIK tidak ditemukan dalam metadata user';
    END IF;
    
    -- Check if NIK exists in members table
    SELECT EXISTS(
      SELECT 1 FROM public.members WHERE nik = user_nik
    ) INTO member_exists;
    
    IF NOT member_exists THEN
      RAISE EXCEPTION 'NIK % tidak terdaftar dalam database. Hubungi sekretariat PD Anda.', user_nik;
    END IF;
  END IF;
  
  -- Insert into profiles with role and NIK from metadata
  INSERT INTO public.profiles (user_id, role, branch_id, nik)
  VALUES (
    NEW.id,
    user_role::app_role,
    (NEW.raw_user_meta_data->>'pd_id')::uuid,
    user_nik
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();