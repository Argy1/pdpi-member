-- Create periods table for managing payment periods and tariffs
CREATE TABLE IF NOT EXISTS public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  tariff_per_year BIGINT NOT NULL DEFAULT 300000,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for periods
CREATE POLICY "Anyone can view periods"
  ON public.periods
  FOR SELECT
  USING (true);

CREATE POLICY "Admin pusat can manage periods"
  ON public.periods
  FOR ALL
  USING (has_role(auth.uid(), 'admin_pusat'))
  WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- Add index
CREATE INDEX idx_periods_year ON public.periods(year DESC);
CREATE INDEX idx_periods_status ON public.periods(status);

-- Trigger for updated_at
CREATE TRIGGER update_periods_updated_at
  BEFORE UPDATE ON public.periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default periods
INSERT INTO public.periods (year, tariff_per_year, due_date, status) VALUES
  (2025, 300000, '2025-12-31', 'active'),
  (2024, 300000, '2024-12-31', 'completed'),
  (2023, 300000, '2023-12-31', 'completed')
ON CONFLICT (year) DO NOTHING;