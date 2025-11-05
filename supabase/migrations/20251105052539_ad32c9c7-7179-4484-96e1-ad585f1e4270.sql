-- Add city/kabupaten columns for tempat_praktek_2 and tempat_praktek_3
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS kota_kabupaten_praktek_2 text,
ADD COLUMN IF NOT EXISTS provinsi_praktek_2 text,
ADD COLUMN IF NOT EXISTS kota_kabupaten_praktek_3 text,
ADD COLUMN IF NOT EXISTS provinsi_praktek_3 text;