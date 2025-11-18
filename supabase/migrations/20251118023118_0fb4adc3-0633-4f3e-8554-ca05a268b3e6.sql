-- Fix operator does not exist error for app_role enum
-- We need to cast app_role to text before using LIKE operator

-- Drop triggers first, then functions
DROP TRIGGER IF EXISTS notify_admins_on_member_changes ON members;
DROP TRIGGER IF EXISTS notify_admins_member_changes_trigger ON members;
DROP FUNCTION IF EXISTS notify_admins_member_changes() CASCADE;

DROP TRIGGER IF EXISTS notify_admins_on_payment_changes ON payment_groups;
DROP TRIGGER IF EXISTS notify_admins_payment_changes_trigger ON payment_groups;
DROP FUNCTION IF EXISTS notify_admins_payment_changes() CASCADE;

DROP TRIGGER IF EXISTS on_change_request_created ON member_change_requests;
DROP TRIGGER IF EXISTS notify_on_change_request_trigger ON member_change_requests;
DROP FUNCTION IF EXISTS notify_on_change_request() CASCADE;

-- Recreate notify_admins_member_changes function with proper casting
CREATE OR REPLACE FUNCTION public.notify_admins_member_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  member_branch TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get member branch
  SELECT cabang INTO member_branch FROM members WHERE id = COALESCE(NEW.id, OLD.id);
  
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
  
  -- Notify admin_cabang for their branch (FIXED: cast role to text before LIKE)
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
$function$;

CREATE TRIGGER notify_admins_on_member_changes
  AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_member_changes();

-- Recreate notify_admins_payment_changes function with proper casting
CREATE OR REPLACE FUNCTION public.notify_admins_payment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  branch_name TEXT;
BEGIN
  -- Get branch name if pd_scope exists
  IF NEW.pd_scope IS NOT NULL THEN
    SELECT name INTO branch_name FROM branches WHERE id = NEW.pd_scope;
  END IF;
  
  -- Handle new payment (needs confirmation)
  IF TG_OP = 'INSERT' AND NEW.status = 'PENDING' AND NEW.method = 'bank_transfer' THEN
    notification_title := 'Permintaan Konfirmasi Pembayaran';
    notification_message := 'Pembayaran baru dengan kode ' || NEW.group_code || ' menunggu konfirmasi transfer.';
    notification_type := 'warning';
    
  -- Handle payment status changes
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'PAID' THEN
      notification_title := 'Pembayaran Berhasil';
      notification_message := 'Pembayaran dengan kode ' || NEW.group_code || ' telah dikonfirmasi dan berhasil.';
      notification_type := 'success';
    ELSIF NEW.status = 'EXPIRED' THEN
      notification_title := 'Pembayaran Kadaluarsa';
      notification_message := 'Pembayaran dengan kode ' || NEW.group_code || ' telah kadaluarsa.';
      notification_type := 'error';
    ELSIF NEW.status = 'FAILED' THEN
      notification_title := 'Pembayaran Gagal';
      notification_message := 'Pembayaran dengan kode ' || NEW.group_code || ' gagal diproses.';
      notification_type := 'error';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Notify admin_pusat
  INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
  SELECT 
    p.user_id,
    notification_title,
    notification_message,
    notification_type,
    NEW.id,
    'payment_groups'
  FROM profiles p
  WHERE p.role = 'admin_pusat';
  
  -- Notify admin_cabang for their branch (FIXED: removed LIKE, use direct comparison)
  IF NEW.pd_scope IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
    SELECT 
      p.user_id,
      notification_title,
      notification_message,
      notification_type,
      NEW.id,
      'payment_groups'
    FROM profiles p
    WHERE p.branch_id = NEW.pd_scope
      AND p.role = 'admin_cabang';
  END IF;
  
  -- Also notify the person who created the payment about status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('PAID', 'EXPIRED', 'FAILED') THEN
    INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
    VALUES (
      NEW.created_by,
      notification_title,
      notification_message,
      notification_type,
      NEW.id,
      'payment_groups'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER notify_admins_on_payment_changes
  AFTER INSERT OR UPDATE ON payment_groups
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_payment_changes();

-- Recreate notify_on_change_request function with proper casting
CREATE OR REPLACE FUNCTION public.notify_on_change_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  member_name TEXT;
  requester_email TEXT;
  member_branch TEXT;
BEGIN
  -- Get member info
  SELECT nama, cabang INTO member_name, member_branch 
  FROM public.members 
  WHERE id = NEW.member_id;
  
  -- Get requester email
  SELECT email INTO requester_email
  FROM auth.users
  WHERE id = NEW.requested_by;
  
  -- Notify admin_pusat
  INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
  SELECT 
    p.user_id,
    'Usulan Perubahan Data Baru',
    'Admin Cabang (' || COALESCE(requester_email, 'Unknown') || ') mengajukan perubahan data untuk anggota: ' || COALESCE(member_name, 'Unknown'),
    'change_request',
    NEW.id,
    'member_change_requests'
  FROM profiles p
  WHERE p.role = 'admin_pusat';
  
  -- Notify admin_cabang for the same branch (FIXED: removed LIKE, use direct comparison)
  IF member_branch IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_id, related_table)
    SELECT 
      p.user_id,
      'Usulan Perubahan Data Baru',
      'Usulan perubahan data untuk anggota: ' || COALESCE(member_name, 'Unknown'),
      'change_request',
      NEW.id,
      'member_change_requests'
    FROM profiles p
    JOIN branches b ON p.branch_id = b.id
    WHERE b.name = member_branch
      AND p.role = 'admin_cabang'
      AND p.user_id != NEW.requested_by;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_change_request_created
  AFTER INSERT ON member_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_change_request();