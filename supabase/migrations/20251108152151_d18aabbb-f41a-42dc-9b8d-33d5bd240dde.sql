
-- Fix member with NULL gender based on Balinese name pattern
-- "Ni" prefix indicates female in Balinese names
UPDATE members
SET jenis_kelamin = 'P'
WHERE id = '631fb8b0-8111-438a-b271-861cf524196e'
  AND nama = 'Ni Made Restiawati'
  AND jenis_kelamin IS NULL;

-- Add a check to find any other members with NULL gender for future reference
-- This is just a comment to document the issue was found and fixed
