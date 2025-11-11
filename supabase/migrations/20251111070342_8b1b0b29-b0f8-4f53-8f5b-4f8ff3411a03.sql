-- Add new columns to payment_groups (safe migration with IF NOT EXISTS checks)
DO $$ 
BEGIN
  -- Add paid_by_admin column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_groups' 
    AND column_name = 'paid_by_admin'
  ) THEN
    ALTER TABLE public.payment_groups 
    ADD COLUMN paid_by_admin boolean DEFAULT false;
  END IF;

  -- Add payer_role column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_groups' 
    AND column_name = 'payer_role'
  ) THEN
    ALTER TABLE public.payment_groups 
    ADD COLUMN payer_role text DEFAULT 'user';
  END IF;

  -- Add pd_scope column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_groups' 
    AND column_name = 'pd_scope'
  ) THEN
    ALTER TABLE public.payment_groups 
    ADD COLUMN pd_scope uuid REFERENCES public.branches(id);
  END IF;
END $$;

-- Add check constraint for payer_role (drop first if exists to avoid conflicts)
DO $$
BEGIN
  ALTER TABLE public.payment_groups 
  DROP CONSTRAINT IF EXISTS payment_groups_payer_role_check;
  
  ALTER TABLE public.payment_groups 
  ADD CONSTRAINT payment_groups_payer_role_check 
  CHECK (payer_role IN ('user', 'admin_pusat', 'admin_cabang'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update RLS policies for payment_groups

-- DROP existing policies to recreate them
DROP POLICY IF EXISTS "Admin cabang can update their PD payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Admin cabang can view their PD payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Admin pusat can update all payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Admin pusat can view all payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Authenticated users can insert payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Users can update their own payment groups" ON public.payment_groups;
DROP POLICY IF EXISTS "Users can view their own payment groups" ON public.payment_groups;

-- SELECT policies
CREATE POLICY "Admin pusat can view all payment groups"
ON public.payment_groups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment groups"
ON public.payment_groups
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') AND (
    pd_scope = (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
    OR
    -- Allow viewing groups where all items belong to their PD
    EXISTS (
      SELECT 1 
      FROM public.payment_items pi
      JOIN public.members m ON m.id = pi.member_id
      WHERE pi.payment_group_id = payment_groups.id
      AND m.cabang = (
        SELECT b.name 
        FROM public.branches b
        JOIN public.profiles p ON p.branch_id = b.id
        WHERE p.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can view their own payment groups"
ON public.payment_groups
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() 
  AND (payer_role = 'user' OR payer_role IS NULL OR NOT paid_by_admin)
);

-- INSERT policies
CREATE POLICY "Authenticated users can insert payment groups"
ON public.payment_groups
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid() 
  AND (
    -- User creating for themselves
    (payer_role = 'user' AND NOT paid_by_admin)
    OR
    -- Admin creating on behalf (must have correct role)
    (paid_by_admin = true AND has_role(auth.uid(), payer_role::app_role))
  )
);

-- UPDATE policies
CREATE POLICY "Admin pusat can update all payment groups"
ON public.payment_groups
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'))
WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can update their PD payment groups"
ON public.payment_groups
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') 
  AND pd_scope = (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin_cabang') 
  AND pd_scope = (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own payment groups"
ON public.payment_groups
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() AND (payer_role = 'user' OR NOT paid_by_admin))
WITH CHECK (created_by = auth.uid());

-- Update RLS policies for payment_items

DROP POLICY IF EXISTS "Admin cabang can insert payment items" ON public.payment_items;
DROP POLICY IF EXISTS "Admin cabang can view their PD payment items" ON public.payment_items;
DROP POLICY IF EXISTS "Admin pusat can insert payment items" ON public.payment_items;
DROP POLICY IF EXISTS "Admin pusat can view all payment items" ON public.payment_items;
DROP POLICY IF EXISTS "Users can insert their payment items" ON public.payment_items;
DROP POLICY IF EXISTS "Users can view their payment items" ON public.payment_items;

-- SELECT policies for payment_items
CREATE POLICY "Admin pusat can view all payment items"
ON public.payment_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment items"
ON public.payment_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') AND (
    EXISTS (
      SELECT 1 
      FROM public.payment_groups pg
      WHERE pg.id = payment_items.payment_group_id
      AND pg.pd_scope = (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.members m
      WHERE m.id = payment_items.member_id
      AND m.cabang = (
        SELECT b.name 
        FROM public.branches b
        JOIN public.profiles p ON p.branch_id = b.id
        WHERE p.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can view their payment items"
ON public.payment_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.payment_groups pg
    WHERE pg.id = payment_items.payment_group_id
    AND pg.created_by = auth.uid()
    AND (pg.payer_role = 'user' OR pg.payer_role IS NULL OR NOT pg.paid_by_admin)
  )
);

-- INSERT policies for payment_items
CREATE POLICY "Admin pusat can insert payment items"
ON public.payment_items
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can insert payment items"
ON public.payment_items
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin_cabang'));

CREATE POLICY "Users can insert their payment items"
ON public.payment_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.payment_groups pg
    WHERE pg.id = payment_items.payment_group_id
    AND pg.created_by = auth.uid()
  )
);

-- Update RLS policies for member_dues

DROP POLICY IF EXISTS "Admin cabang can view their PD member dues" ON public.member_dues;
DROP POLICY IF EXISTS "Admin pusat can view all member dues" ON public.member_dues;
DROP POLICY IF EXISTS "System can manage member dues" ON public.member_dues;
DROP POLICY IF EXISTS "Users can view their own member dues" ON public.member_dues;

CREATE POLICY "Admin pusat can view all member dues"
ON public.member_dues
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD member dues"
ON public.member_dues
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_cabang') AND
  EXISTS (
    SELECT 1 
    FROM public.members m
    WHERE m.id = member_dues.member_id
    AND m.cabang = (
      SELECT b.name 
      FROM public.branches b
      JOIN public.profiles p ON p.branch_id = b.id
      WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view their own member dues"
ON public.member_dues
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.members m
    WHERE m.id = member_dues.member_id
    AND m.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- System can manage all member_dues (for triggers/functions)
CREATE POLICY "System can manage member dues"
ON public.member_dues
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);