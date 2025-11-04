-- Fix: Ensure user_roles table is properly synced with profiles
-- First, check if there's data in profiles
DO $$
BEGIN
  -- Clear user_roles table
  DELETE FROM public.user_roles;
  
  -- Sync all existing roles from profiles to user_roles
  INSERT INTO public.user_roles (user_id, role)
  SELECT user_id, role::app_role
  FROM public.profiles
  WHERE role IS NOT NULL
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Synced roles from profiles to user_roles';
END $$;