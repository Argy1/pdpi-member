-- Update all occurrences of "DI Yogyakarta" to "Yogyakarta" in members table
UPDATE members 
SET provinsi_kantor = 'Yogyakarta' 
WHERE provinsi_kantor ILIKE '%DI%Yogyakarta%' 
   OR provinsi_kantor ILIKE '%D.I%Yogyakarta%'
   OR provinsi_kantor = 'Daerah Istimewa Yogyakarta';

UPDATE members 
SET provinsi = 'Yogyakarta' 
WHERE provinsi ILIKE '%DI%Yogyakarta%' 
   OR provinsi ILIKE '%D.I%Yogyakarta%'
   OR provinsi = 'Daerah Istimewa Yogyakarta';

UPDATE members 
SET provinsi_rumah = 'Yogyakarta' 
WHERE provinsi_rumah ILIKE '%DI%Yogyakarta%' 
   OR provinsi_rumah ILIKE '%D.I%Yogyakarta%'
   OR provinsi_rumah = 'Daerah Istimewa Yogyakarta';