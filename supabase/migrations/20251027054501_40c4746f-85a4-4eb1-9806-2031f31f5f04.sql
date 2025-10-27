-- Add a generated column for numeric NPA sorting
-- This allows sorting NPA as numbers instead of strings (999 vs 1000)

-- First add the column as nullable
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS npa_numeric INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN npa ~ '^[0-9]+$' THEN npa::integer 
    ELSE NULL 
  END
) STORED;

-- Create an index for better sorting performance
CREATE INDEX IF NOT EXISTS idx_members_npa_numeric ON public.members(npa_numeric);

-- Add comment to explain the column
COMMENT ON COLUMN public.members.npa_numeric IS 'Generated column for numeric sorting of NPA values';