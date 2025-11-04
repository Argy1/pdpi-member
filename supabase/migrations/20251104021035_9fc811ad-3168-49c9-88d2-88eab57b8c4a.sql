-- Ensure gelar_fisr column only contains 'Ya' or 'Tidak' values
-- Update any NULL or empty values to 'Tidak' for consistency
UPDATE members 
SET gelar_fisr = 'Tidak' 
WHERE gelar_fisr IS NULL OR gelar_fisr = '';

-- Create an index on alumni column for better filter performance
CREATE INDEX IF NOT EXISTS idx_members_alumni ON members(alumni) WHERE alumni IS NOT NULL AND alumni != '';

-- Create an index on gelar_fisr column for better filter performance
CREATE INDEX IF NOT EXISTS idx_members_gelar_fisr ON members(gelar_fisr) WHERE gelar_fisr IS NOT NULL AND gelar_fisr != '';