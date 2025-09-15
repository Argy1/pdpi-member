-- Drop all existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin pusat can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can manage branches" ON public.branches;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_branch()
RETURNS UUID AS $$
DECLARE
  user_branch_id UUID;
BEGIN
  SELECT branch_id INTO user_branch_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN user_branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pusat can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR public.get_current_user_role() = 'ADMIN_PUSAT'
);

CREATE POLICY "Admin cabang can view branch profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR (
    public.get_current_user_role() = 'ADMIN_CABANG' 
    AND branch_id = public.get_current_user_branch()
  )
);

CREATE POLICY "Admins can manage profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR public.get_current_user_role() IN ('ADMIN_PUSAT', 'ADMIN_CABANG')
);

-- Create branch policies using security definer functions
CREATE POLICY "All authenticated users can view branches" 
ON public.branches 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage branches" 
ON public.branches 
FOR ALL 
TO authenticated 
USING (public.get_current_user_role() IN ('ADMIN_PUSAT', 'ADMIN_CABANG'));