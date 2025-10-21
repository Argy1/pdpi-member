-- Add new columns for RS Type 2 and Healthcare Facilities 2 for each practice location
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS tempat_praktek_1_tipe_2 TEXT,
ADD COLUMN IF NOT EXISTS tempat_praktek_1_alkes_2 TEXT,
ADD COLUMN IF NOT EXISTS tempat_praktek_2_tipe_2 TEXT,
ADD COLUMN IF NOT EXISTS tempat_praktek_2_alkes_2 TEXT,
ADD COLUMN IF NOT EXISTS tempat_praktek_3_tipe_2 TEXT,
ADD COLUMN IF NOT EXISTS tempat_praktek_3_alkes_2 TEXT;

-- Add comment to clarify the column purposes
COMMENT ON COLUMN public.members.tempat_praktek_1_tipe IS 'Tipe RS 1: Paripurna, Utama, Madya, Dasar, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_1_tipe_2 IS 'Tipe RS 2: Rs Tipe A, Rs Tipe B, Rs Tipe C, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_1_alkes IS 'Fasilitas Kesehatan 1 (filtered by Tipe RS 1)';
COMMENT ON COLUMN public.members.tempat_praktek_1_alkes_2 IS 'Fasilitas Kesehatan 2 (all facilities)';

COMMENT ON COLUMN public.members.tempat_praktek_2_tipe IS 'Tipe RS 1: Paripurna, Utama, Madya, Dasar, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_2_tipe_2 IS 'Tipe RS 2: Rs Tipe A, Rs Tipe B, Rs Tipe C, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_2_alkes IS 'Fasilitas Kesehatan 1 (filtered by Tipe RS 1)';
COMMENT ON COLUMN public.members.tempat_praktek_2_alkes_2 IS 'Fasilitas Kesehatan 2 (all facilities)';

COMMENT ON COLUMN public.members.tempat_praktek_3_tipe IS 'Tipe RS 1: Paripurna, Utama, Madya, Dasar, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_3_tipe_2 IS 'Tipe RS 2: Rs Tipe A, Rs Tipe B, Rs Tipe C, Klinik Pribadi';
COMMENT ON COLUMN public.members.tempat_praktek_3_alkes IS 'Fasilitas Kesehatan 1 (filtered by Tipe RS 1)';
COMMENT ON COLUMN public.members.tempat_praktek_3_alkes_2 IS 'Fasilitas Kesehatan 2 (all facilities)';