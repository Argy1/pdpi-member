-- Update members table to ensure fasilitas_kesehatan can store facilities by practice location
-- The column already exists as jsonb, this is just to ensure it's properly structured

-- Add comment to document the expected structure
COMMENT ON COLUMN members.fasilitas_kesehatan IS 'Stores healthcare facilities in format: {"praktek1": ["facility1", "facility2"], "praktek2": [...], "praktek3": [...]}';