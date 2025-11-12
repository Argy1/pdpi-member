export interface Member {
  id: string
  cabang?: string
  status?: string
  npa?: string
  nama: string
  jenis_kelamin?: "L" | "P"
  gelar?: string
  gelar2?: string
  gelar_fisr?: string
  tempat_lahir?: string
  tgl_lahir?: string
  alumni?: string
  thn_lulus?: number
  tempat_tugas?: string
  kota_kabupaten_kantor?: string
  provinsi_kantor?: string
  alamat_rumah?: string
  kota_kabupaten_rumah?: string
  provinsi_rumah?: string
  no_hp?: string
  email?: string
  foto?: string
  keterangan?: string
  tempat_praktek_1?: string
  tempat_praktek_1_tipe?: string
  tempat_praktek_1_tipe_2?: string
  tempat_praktek_1_alkes?: string
  tempat_praktek_1_alkes_2?: string
  tempat_praktek_2?: string
  tempat_praktek_2_tipe?: string
  tempat_praktek_2_tipe_2?: string
  tempat_praktek_2_alkes?: string
  tempat_praktek_2_alkes_2?: string
  kota_kabupaten_praktek_2?: string
  provinsi_praktek_2?: string
  tempat_praktek_3?: string
  tempat_praktek_3_tipe?: string
  tempat_praktek_3_tipe_2?: string
  tempat_praktek_3_alkes?: string
  tempat_praktek_3_alkes_2?: string
  kota_kabupaten_praktek_3?: string
  provinsi_praktek_3?: string
  fasilitas_kesehatan?: Record<string, string[]>
  // Legal fields
  nik?: string
  no_str?: string
  str_berlaku_sampai?: string
  no_sip?: string
  sip_berlaku_sampai?: string
  // Media fields
  website?: string
  sosial_media?: string
  // Other fields
  jabatan?: string
  created_at: string
  updated_at: string
  
  // Legacy fields for compatibility
  spesialis?: string
  subspesialis?: string
  tempatLahir?: string
  tanggalLahir?: string
  jenisKelamin?: "L" | "P"
  tahunLulus?: number
  tempatTugas?: string
  alamat?: string
  kota?: string
  kota_kabupaten?: string // Keep for backward compatibility
  provinsi?: string // Keep for backward compatibility
  alamatRumah?: string
  kotaRumah?: string
  provinsiRumah?: string
  pd?: string
  rumahSakit?: string
  unitKerja?: string
  noSTR?: string
  strBerlakuSampai?: string
  noSIP?: string
  sipBerlakuSampai?: string
  keteranganStatus?: string
  kontakEmail?: string
  kontakTelepon?: string
  sosialMedia?: string
  fotoUrl?: string
  cabangId?: string
  createdAt?: string
  updatedAt?: string
}

export interface MemberFilters {
  query?: string
  provinsi?: string[]
  pd?: string[]
  subspesialis?: string[]
  status?: string[]
  namaHurufDepan?: string[]
  hospitalType?: string[]
  namaRS?: string
  npa?: string
  kota?: string[]
  // New office location filters
  provinsi_kantor?: string[]
  kota_kabupaten_kantor?: string[]
  gelar_fisr?: string[]
  alumni?: string[]
}

export interface MemberSort {
  field: keyof Member
  direction: "asc" | "desc"
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}