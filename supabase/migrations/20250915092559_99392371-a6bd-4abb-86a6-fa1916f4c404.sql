-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin pusat can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin cabang can view branch profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can manage branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "All authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;

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

-- Create simple, non-recursive RLS policies
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

-- Simple branch access policy
CREATE POLICY "All authenticated users can view branches" 
ON public.branches 
FOR SELECT 
TO authenticated 
USING (true);