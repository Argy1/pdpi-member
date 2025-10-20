-- Add admin_cabang_kalteng to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t 
                 JOIN pg_enum e ON t.oid = e.enumtypid 
                 WHERE t.typname = 'app_role' AND e.enumlabel = 'admin_cabang_kalteng') THEN
    ALTER TYPE app_role ADD VALUE 'admin_cabang_kalteng';
  END IF;
END $$;

-- Drop existing update policies for members
DROP POLICY IF EXISTS "Admin cabang kalteng can update their branch members" ON members;

-- Create policy for admin_cabang_kalteng
CREATE POLICY "Admin cabang kalteng can update their branch members"
ON members
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin_cabang_kalteng'::app_role) 
  AND cabang = 'Cabang Kalimantan Tengah'
)
WITH CHECK (
  has_role(auth.uid(), 'admin_cabang_kalteng'::app_role)
  AND cabang = 'Cabang Kalimantan Tengah'
);