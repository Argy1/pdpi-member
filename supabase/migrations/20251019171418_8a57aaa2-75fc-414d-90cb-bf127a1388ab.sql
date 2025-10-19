-- Add admin_cabang_maluku to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t 
                 JOIN pg_enum e ON t.oid = e.enumtypid 
                 WHERE t.typname = 'app_role' AND e.enumlabel = 'admin_cabang_maluku') THEN
    ALTER TYPE app_role ADD VALUE 'admin_cabang_maluku';
  END IF;
END $$;

-- Drop existing update policies
DROP POLICY IF EXISTS "Admin pusat can update all members" ON members;
DROP POLICY IF EXISTS "Admin cabang maluku can update their branch members" ON members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON members;

-- Create new policies for updating members
CREATE POLICY "Admin pusat can update all members"
ON members
FOR UPDATE
USING (has_role(auth.uid(), 'admin_pusat'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_pusat'::app_role));

CREATE POLICY "Admin cabang maluku can update their branch members"
ON members
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin_cabang_maluku'::app_role) 
  AND cabang = 'Cabang Maluku Selatan dan Utara'
)
WITH CHECK (
  has_role(auth.uid(), 'admin_cabang_maluku'::app_role)
  AND cabang = 'Cabang Maluku Selatan dan Utara'
);