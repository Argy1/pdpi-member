import { supabase } from '@/integrations/supabase/client'

export interface ExcelMemberData {
  CABANG: string
  STATUS: string
  NPA: string
  NAMA: string
  'JENIS KELAMIN': string
  'GELAR 1': string
  'GELAR 2': string
  'TEMPAT LAHIR': string
  'TGL LAHIR': string
  ALUMNI: string
  'THN LULUS': string
  'TEMPAT TUGAS/RS': string
  'KOTA/KABUPATEN': string
  PROVINSI: string
  'ALAMAT RUMAH/KORESPONDENSI': string
  'KOTA/KABUPATEN_RUMAH': string
  'PROVINSI_RUMAH': string
  'NO HP': string
  EMAIL: string
  FOTO: string
  KETERANGAN: string
}

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr === 'Kosong') return null
  
  // Handle DD-MM-YY format
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const [day, month, year] = parts
    const fullYear = year.length === 2 ? `19${year}` : year
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return null
}

const parseNumber = (numStr: string): number | null => {
  if (!numStr || numStr === 'Kosong') return null
  const num = parseInt(numStr)
  return isNaN(num) ? null : num
}

const cleanText = (text: string): string | null => {
  if (!text || text === 'Kosong' || text === '-') return null
  return text.trim()
}

export const convertExcelToMemberData = (excelData: ExcelMemberData[]) => {
  return excelData.map(row => ({
    cabang: cleanText(row.CABANG),
    status: cleanText(row.STATUS) || 'AKTIF',
    npa: cleanText(row.NPA),
    nama: row.NAMA?.trim() || 'Unknown',
    jenis_kelamin: cleanText(row['JENIS KELAMIN']) as 'L' | 'P' | null,
    gelar: cleanText(row['GELAR 1']),
    gelar2: cleanText(row['GELAR 2']),
    tempat_lahir: cleanText(row['TEMPAT LAHIR']),
    tgl_lahir: parseDate(row['TGL LAHIR']),
    alumni: cleanText(row.ALUMNI),
    thn_lulus: parseNumber(row['THN LULUS']),
    tempat_tugas: cleanText(row['TEMPAT TUGAS/RS']),
    kota_kabupaten: cleanText(row['KOTA/KABUPATEN']),
    provinsi: cleanText(row.PROVINSI),
    alamat_rumah: cleanText(row['ALAMAT RUMAH/KORESPONDENSI']),
    kota_kabupaten_rumah: cleanText(row['KOTA/KABUPATEN_RUMAH']),
    provinsi_rumah: cleanText(row['PROVINSI_RUMAH']),
    no_hp: cleanText(row['NO HP']),
    email: cleanText(row.EMAIL),
    foto: cleanText(row.FOTO),
    keterangan: cleanText(row.KETERANGAN)
  })).filter(member => member.nama && member.nama !== 'Unknown')
}

export const importMembersToDatabase = async (memberData: any[]) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()

    if (error) {
      console.error('Error importing members:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error importing members to database:', error)
    throw error
  }
}