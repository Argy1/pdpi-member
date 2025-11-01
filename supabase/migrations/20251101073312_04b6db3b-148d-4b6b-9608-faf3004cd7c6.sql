-- Add subspesialis column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS subspesialis TEXT;