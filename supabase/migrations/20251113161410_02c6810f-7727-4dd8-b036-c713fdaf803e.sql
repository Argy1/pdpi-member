-- Add unique constraint on NIK column to prevent duplicates
-- First, we need to handle existing duplicate
-- Keep the first record and clear NIK from duplicate
UPDATE members 
SET nik = NULL
WHERE id = 'cd1beb51-de70-488b-9690-f3e25af642b1' -- Ida Bagus Ngurah Rai duplicate
AND nik = '3175021408740012';

-- Now add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_nik_unique 
ON members(nik) 
WHERE nik IS NOT NULL AND nik != '';

-- Add comment
COMMENT ON INDEX idx_members_nik_unique IS 'Ensure NIK is unique across all members';