-- Fix profiles table to allow 'user' role for member registration
-- Problem: CHECK CONSTRAINT only allows 'admin_pusat' and 'admin_cabang'
-- Solution: Remove constraint, temporarily drop trigger, change column type, recreate trigger

-- Step 1: Drop the restrictive CHECK CONSTRAINT
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Temporarily drop the trigger that depends on role column
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON public.profiles;

-- Step 3: Change role column from TEXT to app_role enum type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING role::app_role;

-- Step 4: Ensure role column is NOT NULL (for data integrity)
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Step 5: Recreate the trigger
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_user_roles();