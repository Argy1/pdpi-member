export interface Member {
  id: string
  cabang?: string
  status?: string
  npa?: string
  nama: string
  jenis_kelamin?: "L" | "P"
  gelar?: string
  gelar2?: string
  tempat_lahir?: string
  tgl_lahir?: string
  alumni?: string
  thn_lulus?: number
  tempat_tugas?: string
  kota_kabupaten?: string
  provinsi?: string
  alamat_rumah?: string
  kota_kabupaten_rumah?: string
  provinsi_rumah?: string
  no_hp?: string
  email?: string
  foto?: string
  keterangan?: string
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
  alamatRumah?: string
  kotaRumah?: string
  provinsiRumah?: string
  pd?: string
  rumahSakit?: string
  unitKerja?: string
  jabatan?: string
  nik?: string
  noSTR?: string
  strBerlakuSampai?: string
  noSIP?: string
  sipBerlakuSampai?: string
  keteranganStatus?: string
  kontakEmail?: string
  kontakTelepon?: string
  website?: string
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