-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  related_id UUID,
  related_table TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create notification for Super Admins
CREATE OR REPLACE FUNCTION public.notify_super_admins(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_id UUID DEFAULT NULL,
  p_related_table TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notification for all Super Admins
  INSERT INTO public.notifications (user_id, title, message, type, related_id, related_table)
  SELECT 
    p.user_id,
    p_title,
    p_message,
    p_type,
    p_related_id,
    p_related_table
  FROM public.profiles p
  WHERE p.role IN ('admin_pusat', 'ADMIN_PUSAT');
END;
$$;

-- Trigger to notify Super Admins when change request is created
CREATE OR REPLACE FUNCTION public.notify_on_change_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_name TEXT;
  requester_email TEXT;
BEGIN
  -- Get member name
  SELECT nama INTO member_name 
  FROM public.members 
  WHERE id = NEW.member_id;
  
  -- Get requester email
  SELECT email INTO requester_email
  FROM auth.users
  WHERE id = NEW.requested_by;
  
  -- Notify Super Admins
  PERFORM notify_super_admins(
    'Usulan Perubahan Data Anggota Baru',
    'Admin Cabang (' || COALESCE(requester_email, 'Unknown') || ') mengajukan perubahan data untuk anggota: ' || COALESCE(member_name, 'Unknown'),
    'change_request',
    NEW.id,
    'member_change_requests'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for change requests
DROP TRIGGER IF EXISTS trigger_notify_change_request ON public.member_change_requests;
CREATE TRIGGER trigger_notify_change_request
  AFTER INSERT ON public.member_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_change_request();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;