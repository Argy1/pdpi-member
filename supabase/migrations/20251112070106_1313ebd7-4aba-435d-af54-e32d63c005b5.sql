-- Fix column name mismatch: app_role -> role
-- Problem: Database has 'app_role' column but edge function uses 'role'
-- Solution: Rename column, remove default, convert to enum type

-- Step 1: Drop the trigger that depends on the column
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON public.profiles;

-- Step 2: Drop the old CHECK constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_app_role_check;

-- Step 3: Remove default value first (it's 'user'::text which can't auto-cast)
ALTER TABLE public.profiles 
ALTER COLUMN app_role DROP DEFAULT;

-- Step 4: Rename column from app_role to role
ALTER TABLE public.profiles 
RENAME COLUMN app_role TO role;

-- Step 5: Convert column type from TEXT to app_role enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING role::app_role;

-- Step 6: Set default to 'user'::app_role
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user'::app_role;

-- Step 7: Ensure role column is NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Step 8: Recreate the trigger with correct column name
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_user_roles();