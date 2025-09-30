-- Update the generate_search_text function to include office location fields
CREATE OR REPLACE FUNCTION public.generate_search_text(member_row members)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN normalize_text(member_row.nama) || ' ' ||
         COALESCE(normalize_text(member_row.gelar), '') || ' ' ||
         COALESCE(member_row.npa, '') || ' ' ||
         COALESCE(normalize_text(member_row.alumni), '') || ' ' ||
         COALESCE(normalize_text(member_row.tempat_tugas), '') || ' ' ||
         COALESCE(normalize_text(member_row.kota_kabupaten_kantor), '') || ' ' ||
         COALESCE(normalize_text(member_row.provinsi_kantor), '') || ' ' ||
         COALESCE(normalize_text(member_row.kota_kabupaten), '') || ' ' ||
         COALESCE(normalize_text(member_row.provinsi), '') || ' ' ||
         COALESCE(normalize_text(member_row.cabang), '') || ' ' ||
         COALESCE(normalize_text(member_row.alamat_rumah), '') || ' ' ||
         COALESCE(member_row.email, '') || ' ' ||
         COALESCE(member_row.no_hp, '');
END;
$function$;