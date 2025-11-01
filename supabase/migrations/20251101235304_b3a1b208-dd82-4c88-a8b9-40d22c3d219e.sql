-- Add gelar_fisr column to members table
ALTER TABLE public.members 
ADD COLUMN gelar_fisr TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.members.gelar_fisr IS 'Gelar FISR member (Ya/Tidak)';