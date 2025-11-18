-- Create ebooks table
CREATE TABLE public.ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  year INTEGER NOT NULL,
  authors TEXT NOT NULL,
  version TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ID', 'EN')),
  description TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  cover_url TEXT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active ebooks
CREATE POLICY "Anyone can view active ebooks"
  ON public.ebooks
  FOR SELECT
  USING (is_active = true);

-- Admin pusat and admin cabang can view all ebooks
CREATE POLICY "Admins can view all ebooks"
  ON public.ebooks
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- Admin pusat and admin cabang can insert ebooks
CREATE POLICY "Admins can insert ebooks"
  ON public.ebooks
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- Admin pusat and admin cabang can update ebooks
CREATE POLICY "Admins can update ebooks"
  ON public.ebooks
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin_pusat'::app_role) OR
    has_role(auth.uid(), 'admin_cabang'::app_role)
  );

-- Only admin pusat can delete ebooks
CREATE POLICY "Admin pusat can delete ebooks"
  ON public.ebooks
  FOR DELETE
  USING (has_role(auth.uid(), 'admin_pusat'::app_role));

-- Create storage bucket for ebooks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebooks',
  'ebooks',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS Policies

-- Anyone can view files in ebooks bucket
CREATE POLICY "Anyone can view ebook files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ebooks');

-- Admins can upload files
CREATE POLICY "Admins can upload ebook files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ebooks' AND
    (
      has_role(auth.uid(), 'admin_pusat'::app_role) OR
      has_role(auth.uid(), 'admin_cabang'::app_role)
    )
  );

-- Admins can update files
CREATE POLICY "Admins can update ebook files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'ebooks' AND
    (
      has_role(auth.uid(), 'admin_pusat'::app_role) OR
      has_role(auth.uid(), 'admin_cabang'::app_role)
    )
  );

-- Admin pusat can delete files
CREATE POLICY "Admin pusat can delete ebook files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ebooks' AND
    has_role(auth.uid(), 'admin_pusat'::app_role)
  );

-- Trigger to update updated_at
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_ebooks_is_active ON public.ebooks(is_active);
CREATE INDEX idx_ebooks_year ON public.ebooks(year);
CREATE INDEX idx_ebooks_category ON public.ebooks(category);
CREATE INDEX idx_ebooks_created_at ON public.ebooks(created_at DESC);