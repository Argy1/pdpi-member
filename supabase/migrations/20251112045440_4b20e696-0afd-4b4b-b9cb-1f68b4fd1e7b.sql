-- Add Legal columns
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS nik text,
ADD COLUMN IF NOT EXISTS no_str text,
ADD COLUMN IF NOT EXISTS str_berlaku_sampai date,
ADD COLUMN IF NOT EXISTS no_sip text,
ADD COLUMN IF NOT EXISTS sip_berlaku_sampai date;

-- Add Media columns
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS sosial_media text;

-- Add Jabatan column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS jabatan text;

COMMENT ON COLUMN public.members.nik IS 'Nomor Induk Kependudukan';
COMMENT ON COLUMN public.members.no_str IS 'Nomor Surat Tanda Registrasi';
COMMENT ON COLUMN public.members.str_berlaku_sampai IS 'Tanggal berlaku sampai STR';
COMMENT ON COLUMN public.members.no_sip IS 'Nomor Surat Ijin Praktik';
COMMENT ON COLUMN public.members.sip_berlaku_sampai IS 'Tanggal berlaku sampai SIP';
COMMENT ON COLUMN public.members.website IS 'Website pribadi atau profesional';
COMMENT ON COLUMN public.members.sosial_media IS 'Link media sosial (Instagram, LinkedIn, dll)';
COMMENT ON COLUMN public.members.jabatan IS 'Jabatan di tempat kerja';