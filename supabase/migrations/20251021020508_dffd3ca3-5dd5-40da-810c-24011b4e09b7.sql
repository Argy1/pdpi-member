-- Add facilities columns to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS fasilitas_kesehatan jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.members.fasilitas_kesehatan IS 'Array of health facilities available at the practice location, stored as JSON array of strings';
