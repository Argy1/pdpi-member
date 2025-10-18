-- Update existing hospital type values from old to new naming
UPDATE members 
SET tempat_praktek_1_tipe = CASE tempat_praktek_1_tipe
  WHEN 'RS Tipe A' THEN 'Paripurna'
  WHEN 'RS Tipe B' THEN 'Utama'
  WHEN 'RS Tipe C' THEN 'Madya'
  WHEN 'RS Tipe D' THEN 'Dasar'
  ELSE tempat_praktek_1_tipe
END
WHERE tempat_praktek_1_tipe IN ('RS Tipe A', 'RS Tipe B', 'RS Tipe C', 'RS Tipe D');

UPDATE members 
SET tempat_praktek_2_tipe = CASE tempat_praktek_2_tipe
  WHEN 'RS Tipe A' THEN 'Paripurna'
  WHEN 'RS Tipe B' THEN 'Utama'
  WHEN 'RS Tipe C' THEN 'Madya'
  WHEN 'RS Tipe D' THEN 'Dasar'
  ELSE tempat_praktek_2_tipe
END
WHERE tempat_praktek_2_tipe IN ('RS Tipe A', 'RS Tipe B', 'RS Tipe C', 'RS Tipe D');

UPDATE members 
SET tempat_praktek_3_tipe = CASE tempat_praktek_3_tipe
  WHEN 'RS Tipe A' THEN 'Paripurna'
  WHEN 'RS Tipe B' THEN 'Utama'
  WHEN 'RS Tipe C' THEN 'Madya'
  WHEN 'RS Tipe D' THEN 'Dasar'
  ELSE tempat_praktek_3_tipe
END
WHERE tempat_praktek_3_tipe IN ('RS Tipe A', 'RS Tipe B', 'RS Tipe C', 'RS Tipe D');