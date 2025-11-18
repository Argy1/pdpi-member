-- Fix notify_admins_member_changes to avoid recursive query
DROP TRIGGER IF EXISTS notify_admins_on_member_changes ON public.members;
DROP FUNCTION IF EXISTS public.notify_admins_member_changes();

CREATE OR REPLACE FUNCTION public.notify_admins_member_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  member_branch TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get member branch from NEW or OLD directly (not from query to avoid recursion)
  member_branch := COALESCE(NEW.cabang, OLD.cabang);
  
  -- Determine notification content based on operation
  IF TG_OP = 'INSERT' THEN
    notification_title := 'Anggota Baru Ditambahkan';
    notification_message := 'Anggota baru "' || NEW.nama || '" telah ditambahkan ke sistem.';
  ELSIF TG_OP = 'UPDATE' THEN
    notification_title := 'Data Anggota Diperbarui';
    notification_message := 'Data anggota "' || NEW.nama || '" telah diperbarui.';
  ELSIF TG_OP = 'DELETE' THEN
    notification_title := 'Anggota Dihapus';
    notification_message := 'Anggota "' || OLD.nama || '" telah dihapus dari sistem.';
  END IF;
  
  -- Notify all admin_pusat
  INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
  SELECT 
    p.user_id,
    notification_title,
    notification_message,
    'info',
    COALESCE(NEW.id, OLD.id),
    'members'
  FROM profiles p
  WHERE p.role = 'admin_pusat';
  
  -- Notify admin_cabang for their branch
  IF member_branch IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
    SELECT 
      p.user_id,
      notification_title,
      notification_message,
      'info',
      COALESCE(NEW.id, OLD.id),
      'members'
    FROM profiles p
    JOIN branches b ON p.branch_id = b.id
    WHERE b.name = member_branch
      AND p.role = 'admin_cabang';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate trigger
CREATE TRIGGER notify_admins_on_member_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_member_changes();