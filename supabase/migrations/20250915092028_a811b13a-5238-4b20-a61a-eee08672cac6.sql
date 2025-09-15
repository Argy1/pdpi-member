-- Drop all policies that depend on the role column first
DROP POLICY IF EXISTS "Only admins can manage branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Now we can alter the column type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE text;

-- Recreate the branch policy
CREATE POLICY "Only admins can manage branches" 
ON public.branches 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('ADMIN_PUSAT', 'ADMIN_CABANG')
));

-- Create new admin policies for profiles
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

CREATE POLICY "Admins can manage profiles based on role" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ADMIN_PUSAT', 'ADMIN_CABANG')
  )
  OR auth.uid() = user_id
);