-- Relax NIK enforcement in handle_new_user so that it only applies
-- when the metadata actually includes a "nik" field.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
  user_nik TEXT;
  member_exists BOOLEAN;
  existing_profile_count INTEGER;
  has_nik_key BOOLEAN;
BEGIN
  -- Get role from metadata (default to 'user')
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- Detect whether the metadata actually contains a NIK key
  has_nik_key := NEW.raw_user_meta_data ? 'nik';
  
  -- Only read NIK if the key exists to avoid blocking generic signups
  IF has_nik_key THEN
    user_nik := NEW.raw_user_meta_data->>'nik';
  ELSE
    user_nik := NULL;
  END IF;
  
  -- For regular users that are meant to be linked to member data,
  -- we only enforce NIK validation when a NIK key is provided.
  IF user_role = 'user' AND has_nik_key THEN
    IF user_nik IS NULL OR user_nik = '' THEN
      RAISE EXCEPTION 'NIK tidak ditemukan dalam metadata user. Silakan hubungi administrator.';
    END IF;
    
    -- Check if NIK exists in members table
    SELECT EXISTS(
      SELECT 1 FROM public.members WHERE nik = user_nik
    ) INTO member_exists;
    
    IF NOT member_exists THEN
      RAISE EXCEPTION 'NIK % tidak terdaftar dalam database anggota. Hubungi sekretariat PD Anda untuk mendaftarkan data terlebih dahulu.', user_nik;
    END IF;
    
    -- Check if NIK already used in another profile
    SELECT COUNT(*) INTO existing_profile_count
    FROM public.profiles
    WHERE nik = user_nik AND user_id != NEW.id;
    
    IF existing_profile_count > 0 THEN
      RAISE EXCEPTION 'NIK % sudah terdaftar dan terhubung dengan akun lain. Gunakan NIK yang berbeda atau hubungi administrator jika ini adalah kesalahan.', user_nik;
    END IF;
  END IF;
  
  -- Insert or update profile with role and optional NIK from metadata
  INSERT INTO public.profiles (user_id, role, branch_id, nik)
  VALUES (
    NEW.id,
    user_role::app_role,
    (NEW.raw_user_meta_data->>'pd_id')::uuid,
    user_nik
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    branch_id = EXCLUDED.branch_id,
    nik = EXCLUDED.nik;
  
  RETURN NEW;
END;
$function$;