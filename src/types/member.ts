export interface Member {
  id: string
  nama: string
  gelar?: string
  gelar2?: string
  npa?: string
  spesialis?: string
  subspesialis?: string
  tempatLahir?: string
  tanggalLahir?: string
  jenisKelamin?: "L" | "P"
  alumni?: string
  tahunLulus?: number
  tempatTugas?: string
  alamat?: string
  kota?: string
  provinsi?: string
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
  status?: "AKTIF" | "TIDAK_AKTIF" | "PENDING"
  keteranganStatus?: string
  kontakEmail?: string
  kontakTelepon?: string
  website?: string
  sosialMedia?: string
  fotoUrl?: string
  cabangId?: string
  createdAt: string
  updatedAt: string
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