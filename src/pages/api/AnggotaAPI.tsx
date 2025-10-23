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
  q?: string
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
        q = '', 
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
      const baseFields = 'id, nama, npa, gelar, gelar2, tempat_tugas, status, created_at, cabang, thn_lulus, alumni, tempat_praktek_1, tempat_praktek_1_tipe, tempat_praktek_1_tipe_2, tempat_praktek_1_alkes, tempat_praktek_1_alkes_2, tempat_praktek_2, tempat_praktek_2_tipe, tempat_praktek_2_tipe_2, tempat_praktek_2_alkes, tempat_praktek_2_alkes_2, tempat_praktek_3, tempat_praktek_3_tipe, tempat_praktek_3_tipe_2, tempat_praktek_3_alkes, tempat_praktek_3_alkes_2, email, foto, jenis_kelamin'
      const publicFields = `${baseFields}, kota_kabupaten_kantor, provinsi_kantor, kota_kabupaten, provinsi`
      const adminFields = `${baseFields}, no_hp, alamat_rumah, kota_kabupaten_rumah, provinsi_rumah, tempat_lahir, tgl_lahir, keterangan, kota_kabupaten, provinsi, kota_kabupaten_kantor, provinsi_kantor`

      // Build query conditions
      let query = supabase
        .from('members')
        .select(isAdmin ? adminFields : publicFields)

      // For public scope, exclude certain statuses
      if (!isAdmin) {
        query = query.not('status', 'in', '("Luar Biasa","Meninggal","Muda")')
      }

      // Apply search filter for name (without title/gelar)
      if (q && q.trim()) {
        const searchTerm = q.trim()
        // Search only in nama field, case insensitive
        query = query.ilike('nama', `%${searchTerm}%`)
      }

      // Apply province filter (OR within provinces)
      if (provinsi_kantor) {
        const provinces = provinsi_kantor.split(',').map(p => p.trim()).filter(p => p)
        if (provinces.length > 0) {
          const provinceConditions = provinces.map(province => 
            `provinsi_kantor.ilike.%${province}%`
          ).join(',')
          query = query.or(provinceConditions)
        }
      }

      // Apply PD filter
      if (pd) {
        query = query.ilike('cabang', `%${pd}%`)
      }

      // Apply city filter (OR within cities)
      if (kota_kabupaten_kantor) {
        const cities = kota_kabupaten_kantor.split(',').map(c => c.trim()).filter(c => c)
        if (cities.length > 0) {
          const cityConditions = cities.map(city => 
            `kota_kabupaten_kantor.ilike.%${city}%`
          ).join(',')
          query = query.or(cityConditions)
        }
      }

      // Apply status filter
      if (status) {
        query = query.eq('status', status)
      }

      // Apply alphabetical filter (OR within letters)
      if (namaHurufDepan) {
        const letters = namaHurufDepan.split(',').map(l => l.trim()).filter(l => l)
        if (letters.length > 0) {
          const letterConditions = letters.map(letter => 
            `nama.ilike.${letter}%`
          ).join(',')
          query = query.or(letterConditions)
        }
      }

      // Apply hospital type filter (OR within types)
      if (hospitalType) {
        const types = hospitalType.split(',').map(t => t.trim()).filter(t => t)
        if (types.length > 0) {
          const hospitalConditions = []
          types.forEach(type => {
            // Check across all practice locations for matching type
            hospitalConditions.push(`tempat_praktek_1_tipe.eq.${type}`)
            hospitalConditions.push(`tempat_praktek_2_tipe.eq.${type}`)
            hospitalConditions.push(`tempat_praktek_3_tipe.eq.${type}`)
          })
          if (hospitalConditions.length > 0) {
            query = query.or(hospitalConditions.join(','))
          }
        }
      }

      // Apply hospital name search filter
      if (namaRS && namaRS.trim()) {
        const searchTerm = namaRS.trim()
        const hospitalNameConditions = [
          `tempat_praktek_1.ilike.%${searchTerm}%`,
          `tempat_praktek_2.ilike.%${searchTerm}%`,
          `tempat_praktek_3.ilike.%${searchTerm}%`,
          `tempat_tugas.ilike.%${searchTerm}%`
        ]
        query = query.or(hospitalNameConditions.join(','))
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

      // Build count query with same filters
      let countQuery = supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // For public scope, exclude certain statuses from count
      if (!isAdmin) {
        countQuery = countQuery.not('status', 'in', '("Luar Biasa","Meninggal","Muda")')
      }

      // Apply same search filter for count - name only (without title/gelar)
      if (q && q.trim()) {
        const searchTerm = q.trim()
        // Search only in nama field, case insensitive
        countQuery = countQuery.ilike('nama', `%${searchTerm}%`)
      }

      if (provinsi_kantor) {
        const provinces = provinsi_kantor.split(',').map(p => p.trim()).filter(p => p)
        if (provinces.length > 0) {
          const provinceConditions = provinces.map(province => 
            `provinsi_kantor.ilike.%${province}%`
          ).join(',')
          countQuery = countQuery.or(provinceConditions)
        }
      }

      if (pd) {
        countQuery = countQuery.ilike('cabang', `%${pd}%`)
      }

      if (kota_kabupaten_kantor) {
        const cities = kota_kabupaten_kantor.split(',').map(c => c.trim()).filter(c => c)
        if (cities.length > 0) {
          const cityConditions = cities.map(city => 
            `kota_kabupaten_kantor.ilike.%${city}%`
          ).join(',')
          countQuery = countQuery.or(cityConditions)
        }
      }

      if (status) {
        countQuery = countQuery.eq('status', status)
      }

      // Apply alphabetical filter for count query too
      if (namaHurufDepan) {
        const letters = namaHurufDepan.split(',').map(l => l.trim()).filter(l => l)
        if (letters.length > 0) {
          const letterConditions = letters.map(letter => 
            `nama.ilike.${letter}%`
          ).join(',')
          countQuery = countQuery.or(letterConditions)
        }
      }

      // Apply hospital type filter for count query too
      if (hospitalType) {
        const types = hospitalType.split(',').map(t => t.trim()).filter(t => t)
        if (types.length > 0) {
          const hospitalConditions = []
          types.forEach(type => {
            // Check across all practice locations for matching type
            hospitalConditions.push(`tempat_praktek_1_tipe.eq.${type}`)
            hospitalConditions.push(`tempat_praktek_2_tipe.eq.${type}`)
            hospitalConditions.push(`tempat_praktek_3_tipe.eq.${type}`)
          })
          if (hospitalConditions.length > 0) {
            countQuery = countQuery.or(hospitalConditions.join(','))
          }
        }
      }

      // Apply hospital name search filter for count query too
      if (namaRS && namaRS.trim()) {
        const searchTerm = namaRS.trim()
        const hospitalNameConditions = [
          `tempat_praktek_1.ilike.%${searchTerm}%`,
          `tempat_praktek_2.ilike.%${searchTerm}%`,
          `tempat_praktek_3.ilike.%${searchTerm}%`,
          `tempat_tugas.ilike.%${searchTerm}%`
        ]
        countQuery = countQuery.or(hospitalNameConditions.join(','))
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