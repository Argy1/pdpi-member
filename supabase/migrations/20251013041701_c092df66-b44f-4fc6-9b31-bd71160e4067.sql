-- Fix Critical Security Issues

-- 1. Fix members table - require authentication for viewing member data
DROP POLICY IF EXISTS "Public users can view limited member info" ON members;

CREATE POLICY "Authenticated users can view members"
ON members FOR SELECT
TO authenticated
USING (true);

-- 2. Fix audit_logs - restrict to admin_pusat only
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;

CREATE POLICY "Admin pusat can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin_pusat', 'ADMIN_PUSAT')
  )
);

-- 3. Create secure user_roles system to prevent privilege escalation
CREATE TYPE app_role AS ENUM ('admin_pusat', 'admin_cabang', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Only service role can modify user_roles (no user access)
CREATE POLICY "Service role manages user_roles"
ON user_roles FOR ALL
USING (false);

-- 4. Create security definer function for role checks
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Migrate existing roles from profiles to user_roles
INSERT INTO user_roles (user_id, role)
SELECT user_id, 
  CASE 
    WHEN role IN ('admin_pusat', 'ADMIN_PUSAT') THEN 'admin_pusat'::app_role
    WHEN role IN ('admin_cabang', 'ADMIN_CABANG') THEN 'admin_cabang'::app_role
    ELSE 'user'::app_role
  END
FROM profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Update RLS policies to use security definer function
DROP POLICY IF EXISTS "Admin Cabang can create change requests" ON member_change_requests;
CREATE POLICY "Admin Cabang can create change requests"
ON member_change_requests FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = requested_by AND
  (has_role(auth.uid(), 'admin_cabang') OR has_role(auth.uid(), 'admin_pusat'))
);

DROP POLICY IF EXISTS "Admin Cabang can view their own requests" ON member_change_requests;
CREATE POLICY "Admin Cabang can view their own requests"
ON member_change_requests FOR SELECT
TO authenticated
USING (
  auth.uid() = requested_by OR has_role(auth.uid(), 'admin_pusat')
);

DROP POLICY IF EXISTS "Super Admin can update change requests" ON member_change_requests;
CREATE POLICY "Super Admin can update change requests"
ON member_change_requests FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));

-- 7. Update get_current_user_role function to use user_roles table
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role 
  FROM user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, '');
END;
$$;

-- 8. Update audit_logs policy to use has_role function
DROP POLICY IF EXISTS "Admin pusat can view audit logs" ON audit_logs;
CREATE POLICY "Admin pusat can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin_pusat'));