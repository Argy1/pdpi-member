-- Fix RLS policies for members table
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

-- Create new policies that only allow admin_pusat to insert and delete
CREATE POLICY "Admin pusat can create members"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin_pusat'::app_role));

CREATE POLICY "Admin pusat can delete members"
ON public.members
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'::app_role));

-- Update user_roles RLS policy to allow users to read their own roles
DROP POLICY IF EXISTS "Service role manages user_roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add unique constraint to user_roles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Create function to sync roles from profiles to user_roles
CREATE OR REPLACE FUNCTION sync_profile_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing role for this user
  DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
  
  -- Insert new role based on profile
  IF NEW.role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync roles
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON public.profiles;
CREATE TRIGGER sync_profile_role_trigger
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_role_to_user_roles();

-- Sync existing data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;