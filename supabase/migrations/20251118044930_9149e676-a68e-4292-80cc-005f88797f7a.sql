-- Update RLS policies for ebooks table to only allow admin_pusat for write operations

-- Drop existing admin write policy
DROP POLICY IF EXISTS "Admins can insert ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admins can update ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admin pusat can delete ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admins can view all ebooks" ON public.ebooks;

-- Admin pusat can view all ebooks (including inactive)
CREATE POLICY "Admin pusat can view all ebooks"
ON public.ebooks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

-- Admin pusat can insert ebooks
CREATE POLICY "Admin pusat can insert ebooks"
ON public.ebooks
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- Admin pusat can update ebooks
CREATE POLICY "Admin pusat can update ebooks"
ON public.ebooks
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

-- Admin pusat can delete ebooks
CREATE POLICY "Admin pusat can delete ebooks"
ON public.ebooks
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

-- Update storage policies for ebooks bucket
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can upload to ebooks bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update ebooks files" ON storage.objects;
DROP POLICY IF EXISTS "Admin pusat can delete ebooks files" ON storage.objects;

-- Admin pusat can upload files
CREATE POLICY "Admin pusat can upload to ebooks bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'admin_pusat')
);

-- Admin pusat can update files
CREATE POLICY "Admin pusat can update ebooks files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'admin_pusat')
);

-- Admin pusat can delete files
CREATE POLICY "Admin pusat can delete ebooks files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'admin_pusat')
);