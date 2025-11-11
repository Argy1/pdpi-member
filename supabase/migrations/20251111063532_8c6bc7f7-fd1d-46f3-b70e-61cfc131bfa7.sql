-- Add check constraint for payer_role if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_groups_payer_role_check'
  ) THEN
    ALTER TABLE payment_groups 
    ADD CONSTRAINT payment_groups_payer_role_check 
    CHECK (payer_role IN ('user', 'admin_pusat', 'admin_cabang'));
  END IF;
END $$;

-- Update RLS policies for payment_groups
DROP POLICY IF EXISTS "Admin cabang can insert payment groups" ON payment_groups;
DROP POLICY IF EXISTS "Admin pusat can insert payment groups" ON payment_groups;
DROP POLICY IF EXISTS "Users can insert their own payment groups" ON payment_groups;
DROP POLICY IF EXISTS "Admin cabang can view their PD payment groups" ON payment_groups;
DROP POLICY IF EXISTS "Admin pusat can view all payment groups" ON payment_groups;
DROP POLICY IF EXISTS "Users can view their own payment groups" ON payment_groups;

-- New insert policies
CREATE POLICY "Authenticated users can insert payment groups"
ON payment_groups FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid() AND
  (
    -- Users can create with payer_role = 'user'
    (payer_role = 'user' AND NOT paid_by_admin) OR
    -- Admins can create with paid_by_admin = true
    (paid_by_admin = true AND has_role(auth.uid(), payer_role::app_role))
  )
);

-- New select policies
CREATE POLICY "Admin pusat can view all payment groups"
ON payment_groups FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment groups"
ON payment_groups FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') AND
  pd_scope = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view their own payment groups"
ON payment_groups FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() AND
  (payer_role = 'user' OR payer_role IS NULL OR NOT paid_by_admin)
);

-- Update RLS policies for payment_items
DROP POLICY IF EXISTS "Admin cabang can view their PD payment items" ON payment_items;
DROP POLICY IF EXISTS "Admin pusat can view all payment items" ON payment_items;
DROP POLICY IF EXISTS "Users can view their payment items" ON payment_items;

CREATE POLICY "Admin pusat can view all payment items"
ON payment_items FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment items"
ON payment_items FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') AND
  EXISTS (
    SELECT 1 FROM payment_groups pg
    WHERE pg.id = payment_items.payment_group_id
    AND pg.pd_scope = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can view their payment items"
ON payment_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM payment_groups pg
    WHERE pg.id = payment_items.payment_group_id
    AND pg.created_by = auth.uid()
    AND (pg.payer_role = 'user' OR pg.payer_role IS NULL OR NOT pg.paid_by_admin)
  )
);

-- Update RLS policies for member_dues (keep existing but ensure consistency)
DROP POLICY IF EXISTS "Users can view their own member dues" ON member_dues;

CREATE POLICY "Users can view their own member dues"
ON member_dues FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.id = member_dues.member_id
    AND m.npa IN (
      SELECT npa FROM members WHERE id = member_id
    )
  )
);