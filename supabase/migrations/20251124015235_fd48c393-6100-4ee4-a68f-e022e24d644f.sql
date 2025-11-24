-- Update handle_new_user to ALWAYS require NIK for all signups
-- This enforces that only registered members can sign up
-- Error messages are clear and will be caught by the frontend

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
BEGIN
  -- Get NIK from metadata
  user_nik := NEW.raw_user_meta_data->>'nik';
  
  -- ALWAYS require NIK for any signup (no exceptions)
  IF user_nik IS NULL OR user_nik = '' THEN
    RAISE EXCEPTION 'REGISTRASI_HANYA_UNTUK_ANGGOTA: Pendaftaran hanya untuk anggota terdaftar. Silakan gunakan NIK Anda untuk mendaftar.';
  END IF;
  
  -- Validate NIK format (16 digits)
  IF user_nik !~ '^\d{16}$' THEN
    RAISE EXCEPTION 'NIK_FORMAT_INVALID: NIK harus terdiri dari 16 digit angka.';
  END IF;
  
  -- Check if NIK exists in members table
  SELECT EXISTS(
    SELECT 1 FROM public.members WHERE nik = user_nik
  ) INTO member_exists;
  
  IF NOT member_exists THEN
    RAISE EXCEPTION 'NIK_NOT_FOUND: NIK % tidak terdaftar dalam database anggota. Silakan hubungi sekretariat PD Anda untuk mendaftarkan data terlebih dahulu.', user_nik;
  END IF;
  
  -- Check if NIK already used in another profile
  SELECT COUNT(*) INTO existing_profile_count
  FROM public.profiles
  WHERE nik = user_nik AND user_id != NEW.id;
  
  IF existing_profile_count > 0 THEN
    RAISE EXCEPTION 'NIK_ALREADY_USED: NIK % sudah terdaftar dan terhubung dengan akun lain. Jika ini adalah kesalahan, silakan hubungi administrator.', user_nik;
  END IF;
  
  -- Get role from metadata (default to 'user')
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- Insert profile with validated NIK
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