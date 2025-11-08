-- Create table for visitor statistics
CREATE TABLE IF NOT EXISTS public.visitor_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_visits bigint NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read visitor stats
CREATE POLICY "Anyone can view visitor stats"
ON public.visitor_stats
FOR SELECT
USING (true);

-- Allow system to update visitor stats
CREATE POLICY "System can update visitor stats"
ON public.visitor_stats
FOR UPDATE
USING (true);

-- Allow system to insert visitor stats
CREATE POLICY "System can insert visitor stats"
ON public.visitor_stats
FOR INSERT
WITH CHECK (true);

-- Insert initial record
INSERT INTO public.visitor_stats (total_visits)
VALUES (0)
ON CONFLICT DO NOTHING;

-- Enable realtime for visitor_stats
ALTER TABLE public.visitor_stats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_stats;