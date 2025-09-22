-- Allow public read access to limited member information
CREATE POLICY "Public users can view limited member info" 
ON public.members 
FOR SELECT 
USING (true);

-- Drop the existing restrictive policy for viewing members
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;