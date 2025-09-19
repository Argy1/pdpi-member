-- Fix RLS for branches table
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branches
CREATE POLICY "Anyone can view branches" 
ON public.branches 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert branches" 
ON public.branches 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update branches" 
ON public.branches 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Enable RLS for profiles table  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix function search paths by recreating with SET search_path
CREATE OR REPLACE FUNCTION public.normalize_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.generate_search_text(member_row public.members)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.update_member_search_text()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.search_text = generate_search_text(NEW);
  RETURN NEW;
END;
$$;