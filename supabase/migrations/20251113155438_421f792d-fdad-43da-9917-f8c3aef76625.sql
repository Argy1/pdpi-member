-- Add NIK field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nik TEXT;

-- Create index for faster NIK lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nik ON public.profiles(nik);

-- Update handle_new_user function to save NIK from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
  user_nik TEXT;
BEGIN
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'app_role',
    'user'
  );
  
  -- Get NIK from user metadata
  user_nik := NEW.raw_user_meta_data->>'nik';
  
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
$function$;