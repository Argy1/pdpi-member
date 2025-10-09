-- Add field for medical equipment in practice locations
ALTER TABLE public.members
ADD COLUMN tempat_praktek_1_alkes TEXT,
ADD COLUMN tempat_praktek_2_alkes TEXT,
ADD COLUMN tempat_praktek_3_alkes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.members.tempat_praktek_1_alkes IS 'Alat kesehatan penunjang paru di tempat praktek 1';
COMMENT ON COLUMN public.members.tempat_praktek_2_alkes IS 'Alat kesehatan penunjang paru di tempat praktek 2';
COMMENT ON COLUMN public.members.tempat_praktek_3_alkes IS 'Alat kesehatan penunjang paru di tempat praktek 3';

-- Create audit log table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Add indexes for faster queries
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view audit logs
CREATE POLICY "Authenticated users can view audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Only system can insert audit logs (via trigger)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Determine which fields changed (for UPDATE only)
  IF TG_OP = 'UPDATE' THEN
    FOR field_name IN 
      SELECT column_name::TEXT
      FROM information_schema.columns
      WHERE table_schema = TG_TABLE_SCHEMA
        AND table_name = TG_TABLE_NAME
    LOOP
      IF (to_jsonb(OLD) ->> field_name) IS DISTINCT FROM (to_jsonb(NEW) ->> field_name) THEN
        changed_fields := array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    changed_fields,
    auth.uid()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for members table
CREATE TRIGGER audit_members_changes
AFTER INSERT OR UPDATE OR DELETE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.create_audit_log();

-- Create triggers for member_change_requests table
CREATE TRIGGER audit_change_requests
AFTER INSERT OR UPDATE OR DELETE ON public.member_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.create_audit_log();

-- Add comment for documentation
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all data changes in the system';