-- Add paid_by_admin and payer_role columns to payment_groups
ALTER TABLE payment_groups 
ADD COLUMN paid_by_admin boolean DEFAULT false,
ADD COLUMN payer_role text;

-- Add comment for clarity
COMMENT ON COLUMN payment_groups.paid_by_admin IS 'True if payment was made by admin on behalf of members';
COMMENT ON COLUMN payment_groups.payer_role IS 'Role of the payer: admin_pusat, admin_cabang, or null for regular users';