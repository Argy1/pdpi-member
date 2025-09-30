-- Add office province and city/regency columns to members table
ALTER TABLE public.members 
ADD COLUMN provinsi_kantor text,
ADD COLUMN kota_kabupaten_kantor text;