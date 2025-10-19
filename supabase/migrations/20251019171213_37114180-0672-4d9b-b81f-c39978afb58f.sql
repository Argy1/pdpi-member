-- Add admin_cabang_maluku to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin_cabang_maluku';

-- Update RLS policy on members table to allow branch admins to edit only their branch members
DROP POLICY IF EXISTS "Authenticated users can update members" ON members;

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

-- Update select policy to allow branch admins to see their branch members
DROP POLICY IF EXISTS "Anyone can view members" ON members;

CREATE POLICY "Anyone can view members"
ON members
FOR SELECT
USING (true);