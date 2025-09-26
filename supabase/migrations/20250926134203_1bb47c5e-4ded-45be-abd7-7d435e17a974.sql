-- Add new hospital and clinic fields to members table
ALTER TABLE public.members 
ADD COLUMN rs_tipe_a TEXT,
ADD COLUMN rs_tipe_b TEXT,
ADD COLUMN rs_tipe_c TEXT,
ADD COLUMN klinik_pribadi TEXT;