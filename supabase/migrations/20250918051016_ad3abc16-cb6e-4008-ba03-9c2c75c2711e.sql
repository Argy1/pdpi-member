-- Create members table with all required fields
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cabang TEXT,
  status TEXT DEFAULT 'AKTIF',
  npa TEXT,
  nama TEXT NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  gelar TEXT,
  gelar2 TEXT,
  tempat_lahir TEXT,
  tgl_lahir DATE,
  alumni TEXT,
  thn_lulus INTEGER,
  tempat_tugas TEXT,
  kota_kabupaten TEXT,
  provinsi TEXT,
  alamat_rumah TEXT,
  kota_kabupaten_rumah TEXT,
  provinsi_rumah TEXT,
  no_hp TEXT,
  email TEXT,
  foto TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage members
CREATE POLICY "Authenticated users can view members" 
ON public.members 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create members" 
ON public.members 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" 
ON public.members 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete members" 
ON public.members 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();