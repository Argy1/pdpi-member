-- Update public view to include jenis_kelamin for statistics
DROP VIEW IF EXISTS public_member_directory;

CREATE VIEW public_member_directory 
WITH (security_invoker = true)
AS
SELECT 
  id,
  nama,
  npa,
  gelar,
  gelar2,
  alumni,
  thn_lulus,
  cabang,
  status,
  tempat_tugas,
  kota_kabupaten_kantor,
  provinsi_kantor,
  tempat_praktek_1,
  tempat_praktek_1_tipe,
  tempat_praktek_2,
  tempat_praktek_2_tipe,
  tempat_praktek_3,
  tempat_praktek_3_tipe,
  jenis_kelamin,
  created_at
FROM members
WHERE status NOT IN ('Meninggal', 'Luar Biasa', 'Muda');

-- Grant public read access
GRANT SELECT ON public_member_directory TO anon;
GRANT SELECT ON public_member_directory TO authenticated;