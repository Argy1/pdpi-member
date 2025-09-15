-- Update profiles table to support admin roles
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE text;

-- Update existing RLS policies to work with new admin roles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create new admin policies
CREATE POLICY "Admin pusat can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'ADMIN_PUSAT'
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Admin cabang can view branch profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'ADMIN_CABANG'
    AND p.branch_id = profiles.branch_id
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Admins can manage profiles based on role" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'ADMIN_PUSAT' 
      OR (p.role = 'ADMIN_CABANG' AND p.branch_id = profiles.branch_id)
    )
  )
  OR auth.uid() = user_id
);