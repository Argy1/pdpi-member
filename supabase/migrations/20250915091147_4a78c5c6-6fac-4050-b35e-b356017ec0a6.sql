-- Enable Row Level Security on branches table
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on profiles table  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branches table
-- Allow all authenticated users to read branches (for dropdowns, etc.)
CREATE POLICY "Authenticated users can view branches" 
ON public.branches 
FOR SELECT 
TO authenticated 
USING (true);

-- Only allow admins to insert, update, delete branches
CREATE POLICY "Only admins can manage branches" 
ON public.branches 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));