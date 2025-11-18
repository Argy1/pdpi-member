-- Ensure ebooks table exists with all required columns
CREATE TABLE IF NOT EXISTS public.ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  authors text NOT NULL,
  year int NOT NULL,
  version text NOT NULL,
  language text NOT NULL,
  description text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint NOT NULL,
  cover_url text,
  download_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to make this idempotent
DROP POLICY IF EXISTS "ebooks_select_authenticated" ON public.ebooks;
DROP POLICY IF EXISTS "Anyone can view active ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admins can view all ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admins can insert ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admins can update ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Admin pusat can delete ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "ebooks_admin_write" ON public.ebooks;

-- SELECT policy: authenticated users can view active ebooks
CREATE POLICY "ebooks_select_authenticated" ON public.ebooks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- SELECT policy: admins can view all ebooks (including inactive)
CREATE POLICY "Admins can view all ebooks" ON public.ebooks
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR 
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- INSERT policy: only admins can insert
CREATE POLICY "Admins can insert ebooks" ON public.ebooks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR 
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- UPDATE policy: only admins can update
CREATE POLICY "Admins can update ebooks" ON public.ebooks
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR 
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- DELETE policy: only admin_pusat can delete
CREATE POLICY "Admin pusat can delete ebooks" ON public.ebooks
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin_pusat'::app_role));

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION update_ebooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER set_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_ebooks_updated_at();

-- Create RPC function for incrementing download count (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_ebook_download(ebook_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ebooks
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = ebook_id AND is_active = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_ebook_download(uuid) TO authenticated;

-- Ensure storage bucket exists (will be handled by storage policies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebooks',
  'ebooks',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Storage policies for ebooks bucket
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin pusat can delete ebook files" ON storage.objects;

-- Anyone can view files in ebooks bucket
CREATE POLICY "Anyone can view ebook files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ebooks');

-- Admins can upload files
CREATE POLICY "Admins can upload ebook files" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ebooks' AND (
      has_role(auth.uid(), 'admin_pusat'::app_role) OR 
      has_role(auth.uid(), 'admin_cabang'::app_role)
    )
  );

-- Admins can update files
CREATE POLICY "Admins can update ebook files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ebooks' AND (
      has_role(auth.uid(), 'admin_pusat'::app_role) OR 
      has_role(auth.uid(), 'admin_cabang'::app_role)
    )
  );

-- Only admin_pusat can delete files
CREATE POLICY "Admin pusat can delete ebook files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ebooks' AND 
    has_role(auth.uid(), 'admin_pusat'::app_role)
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ebooks_is_active ON public.ebooks(is_active);
CREATE INDEX IF NOT EXISTS idx_ebooks_year ON public.ebooks(year DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON public.ebooks(category);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON public.ebooks(created_at DESC);