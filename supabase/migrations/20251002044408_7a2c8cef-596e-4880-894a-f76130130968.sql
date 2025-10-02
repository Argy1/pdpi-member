-- Rename existing columns
ALTER TABLE members 
  RENAME COLUMN rs_tipe_a TO tempat_praktek_1;

ALTER TABLE members 
  RENAME COLUMN rs_tipe_b TO tempat_praktek_2;

ALTER TABLE members 
  RENAME COLUMN rs_tipe_c TO tempat_praktek_3;

-- Add new columns for practice type
ALTER TABLE members 
  ADD COLUMN tempat_praktek_1_tipe text;

ALTER TABLE members 
  ADD COLUMN tempat_praktek_2_tipe text;

ALTER TABLE members 
  ADD COLUMN tempat_praktek_3_tipe text;

-- Migrate existing klinik_pribadi data to tempat_praktek columns if they exist
-- This will preserve any existing data in klinik_pribadi by moving it to an available praktek slot
UPDATE members
SET 
  tempat_praktek_1 = CASE 
    WHEN tempat_praktek_1 IS NULL OR tempat_praktek_1 = '' THEN klinik_pribadi
    ELSE tempat_praktek_1
  END,
  tempat_praktek_1_tipe = CASE 
    WHEN (tempat_praktek_1 IS NULL OR tempat_praktek_1 = '') AND klinik_pribadi IS NOT NULL AND klinik_pribadi != '' THEN 'Klinik Pribadi'
    ELSE tempat_praktek_1_tipe
  END
WHERE klinik_pribadi IS NOT NULL AND klinik_pribadi != '';

UPDATE members
SET 
  tempat_praktek_2 = CASE 
    WHEN (tempat_praktek_2 IS NULL OR tempat_praktek_2 = '') 
         AND klinik_pribadi IS NOT NULL 
         AND klinik_pribadi != ''
         AND (tempat_praktek_1 IS NOT NULL AND tempat_praktek_1 != '' AND tempat_praktek_1 != klinik_pribadi)
    THEN klinik_pribadi
    ELSE tempat_praktek_2
  END,
  tempat_praktek_2_tipe = CASE 
    WHEN (tempat_praktek_2 IS NULL OR tempat_praktek_2 = '') 
         AND klinik_pribadi IS NOT NULL 
         AND klinik_pribadi != ''
         AND (tempat_praktek_1 IS NOT NULL AND tempat_praktek_1 != '' AND tempat_praktek_1 != klinik_pribadi)
    THEN 'Klinik Pribadi'
    ELSE tempat_praktek_2_tipe
  END
WHERE klinik_pribadi IS NOT NULL 
  AND klinik_pribadi != ''
  AND (tempat_praktek_1 IS NOT NULL AND tempat_praktek_1 != '' AND tempat_praktek_1 != klinik_pribadi);

-- Drop the klinik_pribadi column
ALTER TABLE members 
  DROP COLUMN klinik_pribadi;

COMMENT ON COLUMN members.tempat_praktek_1 IS 'Nama tempat praktek pertama';
COMMENT ON COLUMN members.tempat_praktek_1_tipe IS 'Tipe: RS Tipe A, RS Tipe B, RS Tipe C, atau Klinik Pribadi';
COMMENT ON COLUMN members.tempat_praktek_2 IS 'Nama tempat praktek kedua';
COMMENT ON COLUMN members.tempat_praktek_2_tipe IS 'Tipe: RS Tipe A, RS Tipe B, RS Tipe C, atau Klinik Pribadi';
COMMENT ON COLUMN members.tempat_praktek_3 IS 'Nama tempat praktek ketiga';
COMMENT ON COLUMN members.tempat_praktek_3_tipe IS 'Tipe: RS Tipe A, RS Tipe B, RS Tipe C, atau Klinik Pribadi';