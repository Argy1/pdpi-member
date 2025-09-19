-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add search_text column to members table for optimized searching
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Function to normalize text for search
CREATE OR REPLACE FUNCTION public.normalize_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN '';
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          unaccent(input_text),
          '^(dr\.?|dr\s)', '', 'gi'
        ),
        '[^\w\s]', '', 'g'
      ),
      '\s+', ' ', 'g'
    )
  );
END;
$$;

-- Function to generate search text
CREATE OR REPLACE FUNCTION public.generate_search_text(member_row public.members)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN normalize_text(member_row.nama) || ' ' ||
         COALESCE(normalize_text(member_row.gelar), '') || ' ' ||
         COALESCE(member_row.npa, '') || ' ' ||
         COALESCE(normalize_text(member_row.alumni), '') || ' ' ||
         COALESCE(normalize_text(member_row.tempat_tugas), '') || ' ' ||
         COALESCE(normalize_text(member_row.kota_kabupaten), '') || ' ' ||
         COALESCE(normalize_text(member_row.provinsi), '') || ' ' ||
         COALESCE(normalize_text(member_row.cabang), '') || ' ' ||
         COALESCE(normalize_text(member_row.alamat_rumah), '') || ' ' ||
         COALESCE(member_row.email, '') || ' ' ||
         COALESCE(member_row.no_hp, '');
END;
$$;

-- Trigger function to update search_text
CREATE OR REPLACE FUNCTION public.update_member_search_text()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_text = generate_search_text(NEW);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic search_text updates
DROP TRIGGER IF EXISTS update_member_search_text_trigger ON public.members;
CREATE TRIGGER update_member_search_text_trigger
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_member_search_text();

-- Create trigram indexes for fast search
CREATE INDEX IF NOT EXISTS idx_members_search_trgm 
ON public.members USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_members_nama_trgm 
ON public.members USING GIN (lower(regexp_replace(nama, '[^a-zA-Z0-9 ]', '', 'g')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_members_npa 
ON public.members (npa);

-- Update existing records with search_text
UPDATE public.members 
SET search_text = generate_search_text(members.*);