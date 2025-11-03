-- Add RLS policy for admin_cabang to update members
-- This allows all admin_cabang users to update member records
CREATE POLICY "Admin cabang can update members"
ON public.members
FOR UPDATE
USING (has_role(auth.uid(), 'admin_cabang'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_cabang'::app_role));