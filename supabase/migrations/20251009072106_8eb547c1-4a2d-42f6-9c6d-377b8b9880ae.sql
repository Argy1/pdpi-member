-- Create table for member change requests
CREATE TABLE public.member_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  changes JSONB NOT NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_member_change_requests_member_id ON public.member_change_requests(member_id);
CREATE INDEX idx_member_change_requests_status ON public.member_change_requests(status);
CREATE INDEX idx_member_change_requests_requested_by ON public.member_change_requests(requested_by);

-- Enable RLS
ALTER TABLE public.member_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Admin Cabang can view their own change requests
CREATE POLICY "Admin Cabang can view their own requests"
ON public.member_change_requests
FOR SELECT
USING (
  auth.uid() = requested_by 
  OR 
  public.get_current_user_role() IN ('admin_pusat', 'ADMIN_PUSAT')
);

-- Policy: Admin Cabang can create change requests
CREATE POLICY "Admin Cabang can create change requests"
ON public.member_change_requests
FOR INSERT
WITH CHECK (
  auth.uid() = requested_by 
  AND 
  public.get_current_user_role() IN ('admin_cabang', 'ADMIN_CABANG', 'admin_pusat', 'ADMIN_PUSAT')
);

-- Policy: Only Super Admin can approve/reject (update)
CREATE POLICY "Super Admin can update change requests"
ON public.member_change_requests
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin_pusat', 'ADMIN_PUSAT')
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_member_change_requests_updated_at
BEFORE UPDATE ON public.member_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.member_change_requests IS 'Stores change requests from Admin Cabang that need Super Admin approval before being applied to members table';