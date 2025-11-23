-- Fix registration issues by ensuring proper constraints and logging
-- This migration improves error handling and prevents duplicate registration issues

-- 1. Add logging function for debugging registration issues
CREATE OR REPLACE FUNCTION public.log_registration_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log registration attempt (optional - for debugging)
  RAISE NOTICE 'Registration attempt for user % with NIK %', 
    NEW.id, 
    NEW.raw_user_meta_data->>'nik';
  RETURN NEW;
END;
$$;

-- 2. Improve handle_new_user function with better error messages
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
  existing_profile_count INTEGER;
BEGIN
  -- Get NIK from user metadata
  user_nik := NEW.raw_user_meta_data->>'nik';
  
  -- Get role from metadata
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- For regular users, NIK MUST exist in members table
  IF user_role = 'user' THEN
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
  
  -- Insert into profiles with role and NIK from metadata
  -- ON CONFLICT DO NOTHING to prevent duplicate key errors
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
$$;

-- 3. Ensure user_id is primary key (should already be, but confirm)
-- This prevents duplicate profiles for same user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_pkey' 
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD PRIMARY KEY (user_id);
  END IF;
END $$;

-- 4. Add index on NIK for faster lookups and duplicate checking
CREATE INDEX IF NOT EXISTS idx_profiles_nik ON public.profiles(nik) WHERE nik IS NOT NULL;

-- 5. Add index on members.nik for faster validation
CREATE INDEX IF NOT EXISTS idx_members_nik ON public.members(nik) WHERE nik IS NOT NULL;

COMMENT ON FUNCTION public.handle_new_user() IS 'Validates NIK and creates profile for new users. Prevents duplicate NIK usage and ensures NIK exists in members table.';
COMMENT ON FUNCTION public.log_registration_attempt() IS 'Logs registration attempts for debugging purposes.';