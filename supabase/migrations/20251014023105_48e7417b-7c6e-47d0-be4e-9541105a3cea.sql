-- Drop existing policies on members table
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can create members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

-- Create new policies that allow public read access
-- Allow everyone (including anonymous users) to view members
CREATE POLICY "Anyone can view members"
ON public.members
FOR SELECT
TO public
USING (true);

-- Only authenticated users can create members
CREATE POLICY "Authenticated users can create members"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update members
CREATE POLICY "Authenticated users can update members"
ON public.members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete members
CREATE POLICY "Authenticated users can delete members"
ON public.members
FOR DELETE
TO authenticated
USING (true);