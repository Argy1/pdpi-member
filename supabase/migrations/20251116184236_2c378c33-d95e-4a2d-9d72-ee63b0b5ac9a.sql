-- Fix infinite recursion in payment_groups RLS policies
-- Drop the problematic policy and recreate with simpler logic

DROP POLICY IF EXISTS "Admin cabang can view their PD payment groups" ON payment_groups;

-- Create new simplified policy for admin_cabang to view payment groups
CREATE POLICY "Admin cabang can view their PD payment groups"
ON payment_groups
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang'::app_role) 
  AND pd_scope = (
    SELECT branch_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Also update the update policy to match
DROP POLICY IF EXISTS "Admin cabang can update their PD payment groups" ON payment_groups;

CREATE POLICY "Admin cabang can update their PD payment groups"
ON payment_groups
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang'::app_role)
  AND pd_scope = (
    SELECT branch_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin_cabang'::app_role)
  AND pd_scope = (
    SELECT branch_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);