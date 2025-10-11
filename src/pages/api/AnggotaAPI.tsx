import { supabase } from '@/integrations/supabase/client'
import { parseSearchQuery, buildSearchConditions } from '@/utils/searchParser'

interface APIResponse<T> {
  data?: T
  error?: string
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

interface GetMembersParams {
  namaAnggota?: string
  provinsi?: string
  provinsi_kantor?: string
  pd?: string
  subspesialis?: string
  namaHurufDepan?: string
  hospitalType?: string
  namaRS?: string
  kota?: string
  kota_kabupaten_kantor?: string
  sort?: string
  limit?: number
  page?: number
  status?: string
  scope?: 'public' | 'admin'
}

export class AnggotaAPI {
  static async getMembers(params: GetMembersParams = {}): Promise<APIResponse<any[]>> {
    try {
      const { 
        namaAnggota = '', 
        provinsi, 
        provinsi_kantor,
        pd, 
        subspesialis, 
        namaHurufDepan,
        hospitalType,
        namaRS,
        kota,
        kota_kabupaten_kantor,
        sort = 'nama_asc', 
        limit = 25, 
        page = 1, 
        status,
        scope = 'public'
      } = params

      const isAdmin = scope === 'admin'

      // Define field selection based on scope - only include existing columns
      const baseFields = 'id, nama, npa, gelar, gelar2, tempat_tugas, status, created_at, cabang, thn_lulus, alumni, tempat_praktek_1, tempat_praktek_1_tipe, tempat_praktek_2, tempat_praktek_2_tipe, tempat_praktek_3, tempat_praktek_3_tipe, email, foto'
      const publicFields = `${baseFields}, kota_kabupaten_kantor, provinsi_kantor`
      const adminFields = `${baseFields}, no_hp, alamat_rumah, kota_kabupaten_rumah, provinsi_rumah, jenis_kelamin, tempat_lahir, tgl_lahir, keterangan, kota_kabupaten, provinsi, kota_kabupaten_kantor, provinsi_kantor`

      // Build query conditions
      let query = supabase
        .from('members')
        .select(isAdmin ? adminFields : publicFields)

      // For public scope, exclude certain statuses
      if (!isAdmin) {
        query = query.not('status', 'in', '("Luar Biasa","Meninggal","Muda")')
      }

      // === COLLECT ALL OR CONDITIONS ===
      const allOrConditions: string[] = []

      // 1. Advanced search filter
      if (namaAnggota && namaAnggota.trim()) {
        const parsedQuery = parseSearchQuery(namaAnggota)
        const searchConditions = buildSearchConditions(parsedQuery, isAdmin)
        if (searchConditions.length > 0) {
          allOrConditions.push(...searchConditions)
        }
      }

      // 2. Province filter
      if (provinsi_kantor) {
        const provinces = provinsi_kantor.split(',').map(p => p.trim()).filter(p => p)
        provinces.forEach(province => {
          allOrConditions.push(`provinsi_kantor.ilike.%${province}%`)
        })
      }

      // 3. City filter
      if (kota_kabupaten_kantor) {
        const cities = kota_kabupaten_kantor.split(',').map(c => c.trim()).filter(c => c)
        cities.forEach(city => {
          allOrConditions.push(`kota_kabupaten_kantor.ilike.%${city}%`)
        })
      }

      // 4. Alphabetical filter
      if (namaHurufDepan) {
        const letters = namaHurufDepan.split(',').map(l => l.trim()).filter(l => l)
        letters.forEach(letter => {
          allOrConditions.push(`nama.ilike.${letter}%`)
        })
      }

      // 5. Hospital type filter
      if (hospitalType) {
        const types = hospitalType.split(',').map(t => t.trim()).filter(t => t)
        types.forEach(type => {
          allOrConditions.push(`tempat_praktek_1_tipe.eq.${type}`)
          allOrConditions.push(`tempat_praktek_2_tipe.eq.${type}`)
          allOrConditions.push(`tempat_praktek_3_tipe.eq.${type}`)
        })
      }

      // 6. Hospital name search
      if (namaRS && namaRS.trim()) {
        const searchTerm = namaRS.trim()
        allOrConditions.push(`tempat_praktek_1.ilike.%${searchTerm}%`)
        allOrConditions.push(`tempat_praktek_2.ilike.%${searchTerm}%`)
        allOrConditions.push(`tempat_praktek_3.ilike.%${searchTerm}%`)
        allOrConditions.push(`tempat_tugas.ilike.%${searchTerm}%`)
      }

      // === APPLY ALL OR CONDITIONS IN ONE CALL ===
      if (allOrConditions.length > 0) {
        query = query.or(allOrConditions.join(','))
      }

      // === APPLY AND CONDITIONS SEPARATELY ===
      // PD filter (uses AND logic)
      if (pd) {
        query = query.ilike('cabang', `%${pd}%`)
      }

      // Status filter (uses AND logic)
      if (status) {
        query = query.eq('status', status)
      }

      // Apply sorting
      const [sortField, sortDirection] = sort.split('_')
      const dbSortField = sortField === 'nama' ? 'nama' : 
                         sortField === 'kota' ? 'kota_kabupaten' : 
                         sortField === 'provinsi' ? 'provinsi' :
                         sortField === 'tahunLulus' ? 'thn_lulus' : 'nama'
      
      query = query.order(dbSortField, { 
        ascending: sortDirection === 'asc' 
      })

      // === BUILD COUNT QUERY WITH SAME LOGIC ===
      let countQuery = supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      if (!isAdmin) {
        countQuery = countQuery.not('status', 'in', '("Luar Biasa","Meninggal","Muda")')
      }

      // Apply same OR conditions for count
      if (allOrConditions.length > 0) {
        countQuery = countQuery.or(allOrConditions.join(','))
      }

      // Apply same AND conditions for count
      if (pd) {
        countQuery = countQuery.ilike('cabang', `%${pd}%`)
      }

      if (status) {
        countQuery = countQuery.eq('status', status)
      }

      // Get total count
      const { count } = await countQuery

      // Apply pagination
      const pageNum = page || 1
      const limitNum = limit || 25
      const offset = (pageNum - 1) * limitNum

      // Get paginated results
      const { data, error } = await query
        .range(offset, offset + limitNum - 1)

      if (error) {
        console.error('Database error details:', error)
        return { 
          error: `Database error: ${error.message || 'Unknown error'}`,
          data: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0
        }
      }

      console.log('Query successful, returned', data?.length, 'records')

      // Transform data for compatibility
      const transformedData = data?.map((member: any) => ({
        ...member,
        // Add legacy field mappings for compatibility
        kota: member.kota_kabupaten,
        rumahSakit: member.tempat_tugas,
        tahunLulus: member.thn_lulus,
        kontakEmail: member.email,
        kontakTelepon: member.no_hp,
        spesialis: member.alumni || 'Pulmonologi',
        subspesialis: '',
        pd: member.cabang || `Cabang ${member.provinsi}`,
        createdAt: member.created_at,
        updatedAt: member.created_at
      })) || []

      return {
        data: transformedData,
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }

    } catch (error) {
      console.error('API error details:', error)
      return { 
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0
      }
    }
  }

  static async getMemberById(id: string): Promise<APIResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { error: 'Member not found' }
        }
        console.error('Database error:', error)
        return { error: 'Database error' }
      }

      // Transform data for compatibility
      const transformedData = {
        ...data,
        // Add legacy field mappings for compatibility
        kota: data.kota_kabupaten,
        rumahSakit: data.tempat_tugas,
        tahunLulus: data.thn_lulus,
        kontakEmail: data.email,
        kontakTelepon: data.no_hp,
        tempatLahir: data.tempat_lahir,
        tanggalLahir: data.tgl_lahir,
        jenisKelamin: data.jenis_kelamin,
        alamat: data.alamat_rumah,
        alamatRumah: data.alamat_rumah,
        kotaRumah: data.kota_kabupaten_rumah,
        provinsiRumah: data.provinsi_rumah,
        spesialis: data.alumni || 'Pulmonologi',
        subspesialis: '',
        pd: data.cabang || `Cabang ${data.provinsi}`,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: transformedData }

    } catch (error) {
      console.error('API error:', error)
      return { error: 'Internal server error' }
    }
  }

  static async getHospitalTypes(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('tempat_praktek_1_tipe, tempat_praktek_2_tipe, tempat_praktek_3_tipe')

      if (error) {
        console.error('Database error:', error)
        return { error: 'Database error' }
      }

      const hospitalTypesSet = new Set<string>()
      
      // Collect all unique hospital types from all three practice locations
      data?.forEach(member => {
        if (member.tempat_praktek_1_tipe && member.tempat_praktek_1_tipe.trim() !== '') {
          hospitalTypesSet.add(member.tempat_praktek_1_tipe)
        }
        if (member.tempat_praktek_2_tipe && member.tempat_praktek_2_tipe.trim() !== '') {
          hospitalTypesSet.add(member.tempat_praktek_2_tipe)
        }
        if (member.tempat_praktek_3_tipe && member.tempat_praktek_3_tipe.trim() !== '') {
          hospitalTypesSet.add(member.tempat_praktek_3_tipe)
        }
      })

      return { data: Array.from(hospitalTypesSet).sort() }

    } catch (error) {
      console.error('API error:', error)
      return { error: 'Internal server error' }
    }
  }

  static async getDebugCounts(): Promise<APIResponse<any>> {
    try {
      // Get total member count
      const { count: anggotaTotal } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // Get active member count
      const { count: anggotaAktif } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF')

      // Get members per branch/province
      const { data: perCabang } = await supabase
        .from('members')
        .select('provinsi, cabang')

      // Group by province/branch
      const branchCounts = perCabang?.reduce((acc: any[], member) => {
        const key = member.cabang || member.provinsi || 'Unknown'
        const existing = acc.find(item => item.cabang === key)
        if (existing) {
          existing.n += 1
        } else {
          acc.push({ cabang: key, n: 1 })
        }
        return acc
      }, []) || []

      // Get last imported member
      const { data: lastMember } = await supabase
        .from('members')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      const lastImportedAt = lastMember?.[0]?.created_at || null

      return {
        data: {
          anggotaTotal: anggotaTotal || 0,
          anggotaAktif: anggotaAktif || 0,
          perCabang: branchCounts.sort((a, b) => b.n - a.n),
          lastImportedAt,
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Debug API error:', error)
      return { error: 'Internal server error' }
    }
  }

  static async getAvailableProvinces(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('provinsi_kantor')
        .not('provinsi_kantor', 'is', null)

      if (error) {
        console.error('Database error:', error)
        return { error: 'Database error' }
      }

      const provinces = [...new Set(data.map(item => item.provinsi_kantor).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))

      return { data: provinces }

    } catch (error) {
      console.error('API error:', error)
      return { error: 'Internal server error' }
    }
  }

  static async getAvailableCities(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('kota_kabupaten_kantor')
        .not('kota_kabupaten_kantor', 'is', null)

      if (error) {
        console.error('Database error:', error)
        return { error: 'Database error' }
      }

      const cities = [...new Set(data.map(item => item.kota_kabupaten_kantor).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))

      return { data: cities }

    } catch (error) {
      console.error('API error:', error)
      return { error: 'Internal server error' }
    }
  }
}