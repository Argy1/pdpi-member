-- Remove RLS policies for admin_cabang_maluku and admin_cabang_kalteng
-- These roles are no longer in use

DROP POLICY IF EXISTS "Admin cabang maluku can update their branch members" ON public.members;
DROP POLICY IF EXISTS "Admin cabang kalteng can update their branch members" ON public.members;