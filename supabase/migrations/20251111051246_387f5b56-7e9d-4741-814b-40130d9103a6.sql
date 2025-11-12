-- Create payment_groups table
CREATE TABLE public.payment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('qris', 'bank_transfer')),
  amount_base BIGINT NOT NULL,
  unique_code INT DEFAULT 0 CHECK (unique_code >= 0 AND unique_code <= 999),
  total_payable BIGINT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED')),
  expired_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  gateway TEXT,
  gateway_tx_id TEXT,
  reference_id TEXT,
  qris_payload JSONB,
  transfer_proof_url TEXT,
  note TEXT,
  pd_scope UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_items table
CREATE TABLE public.payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_group_id UUID REFERENCES payment_groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) NOT NULL,
  npa TEXT,
  year INT NOT NULL,
  amount BIGINT DEFAULT 300000,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create member_dues table
CREATE TABLE public.member_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) NOT NULL,
  npa TEXT,
  year INT NOT NULL,
  status TEXT DEFAULT 'UNPAID' CHECK (status IN ('PAID', 'UNPAID')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, year)
);

-- Create webhook_logs table
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT,
  order_id TEXT,
  payload JSONB,
  verified BOOLEAN DEFAULT false,
  status_parsed TEXT,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false);

-- Enable RLS
ALTER TABLE public.payment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_groups
CREATE POLICY "Admin pusat can view all payment groups"
  ON public.payment_groups FOR SELECT
  USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment groups"
  ON public.payment_groups FOR SELECT
  USING (
    has_role(auth.uid(), 'admin_cabang') AND 
    pd_scope = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their own payment groups"
  ON public.payment_groups FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Admin pusat can insert payment groups"
  ON public.payment_groups FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can insert payment groups"
  ON public.payment_groups FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_cabang'));

CREATE POLICY "Users can insert their own payment groups"
  ON public.payment_groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admin pusat can update all payment groups"
  ON public.payment_groups FOR UPDATE
  USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can update their PD payment groups"
  ON public.payment_groups FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin_cabang') AND 
    pd_scope = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own payment groups"
  ON public.payment_groups FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for payment_items
CREATE POLICY "Admin pusat can view all payment items"
  ON public.payment_items FOR SELECT
  USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD payment items"
  ON public.payment_items FOR SELECT
  USING (
    has_role(auth.uid(), 'admin_cabang') AND 
    EXISTS (
      SELECT 1 FROM payment_groups 
      WHERE id = payment_items.payment_group_id 
      AND pd_scope = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view their payment items"
  ON public.payment_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payment_groups 
      WHERE id = payment_items.payment_group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admin pusat can insert payment items"
  ON public.payment_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can insert payment items"
  ON public.payment_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin_cabang'));

CREATE POLICY "Users can insert their payment items"
  ON public.payment_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM payment_groups 
      WHERE id = payment_items.payment_group_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for member_dues
CREATE POLICY "Admin pusat can view all member dues"
  ON public.member_dues FOR SELECT
  USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin cabang can view their PD member dues"
  ON public.member_dues FOR SELECT
  USING (
    has_role(auth.uid(), 'admin_cabang') AND 
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = member_dues.member_id 
      AND cabang = (SELECT name FROM branches WHERE id = (SELECT branch_id FROM profiles WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can view their own member dues"
  ON public.member_dues FOR SELECT
  USING (
    member_id IN (SELECT id FROM members WHERE npa = (SELECT npa FROM members LIMIT 1))
  );

CREATE POLICY "System can manage member dues"
  ON public.member_dues FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for webhook_logs
CREATE POLICY "Admin pusat can view webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "System can insert webhook logs"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (true);

-- Storage policies for payment-proofs
CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs' AND 
    has_role(auth.uid(), 'admin_pusat')
  );

CREATE POLICY "Users can view their own payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Triggers for updated_at
CREATE TRIGGER update_payment_groups_updated_at
  BEFORE UPDATE ON public.payment_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_items_updated_at
  BEFORE UPDATE ON public.payment_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_dues_updated_at
  BEFORE UPDATE ON public.member_dues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update member_dues when payment is confirmed
CREATE OR REPLACE FUNCTION update_member_dues_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PAID' AND OLD.status != 'PAID' THEN
    -- Update all payment items to PAID
    UPDATE payment_items 
    SET status = 'PAID' 
    WHERE payment_group_id = NEW.id;
    
    -- Insert or update member_dues
    INSERT INTO member_dues (member_id, npa, year, status, paid_at)
    SELECT member_id, npa, year, 'PAID', NEW.paid_at
    FROM payment_items
    WHERE payment_group_id = NEW.id
    ON CONFLICT (member_id, year) 
    DO UPDATE SET status = 'PAID', paid_at = NEW.paid_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER payment_confirmed_update_dues
  AFTER UPDATE ON public.payment_groups
  FOR EACH ROW
  WHEN (NEW.status = 'PAID' AND OLD.status != 'PAID')
  EXECUTE FUNCTION update_member_dues_on_payment();

-- Create indexes for better performance
CREATE INDEX idx_payment_groups_created_by ON payment_groups(created_by);
CREATE INDEX idx_payment_groups_status ON payment_groups(status);
CREATE INDEX idx_payment_groups_pd_scope ON payment_groups(pd_scope);
CREATE INDEX idx_payment_items_payment_group_id ON payment_items(payment_group_id);
CREATE INDEX idx_payment_items_member_id ON payment_items(member_id);
CREATE INDEX idx_member_dues_member_year ON member_dues(member_id, year);
CREATE INDEX idx_webhook_logs_order_id ON webhook_logs(order_id);