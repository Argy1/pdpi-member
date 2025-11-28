-- Fix foreign key constraints to allow member deletion with CASCADE

-- Drop and recreate payment_items foreign key with CASCADE
ALTER TABLE public.payment_items 
DROP CONSTRAINT IF EXISTS payment_items_member_id_fkey;

ALTER TABLE public.payment_items 
ADD CONSTRAINT payment_items_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

-- Drop and recreate member_dues foreign key with CASCADE
ALTER TABLE public.member_dues 
DROP CONSTRAINT IF EXISTS member_dues_member_id_fkey;

ALTER TABLE public.member_dues 
ADD CONSTRAINT member_dues_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;