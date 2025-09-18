import { supabase } from '@/integrations/supabase/client'

interface APIResponse<T> {
  data?: T
  error?: string
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export class AnggotaAPI {
  static async getMembers(params: {
    q?: string
    provinsi?: string
    pd?: string
    subspesialis?: string
    sort?: string
    limit?: number
    page?: number
    status?: string
  }): Promise<APIResponse<any[]>> {
    try {
      const { 
        q = '', 
        provinsi, 
        pd, 
        subspesialis, 
        sort = 'nama_asc', 
        limit = 25, 
        page = 1, 
        status 
      } = params

      // Build query conditions
      let query = supabase
        .from('members')
        .select(`
          id, nama, npa, gelar, tempat_tugas, 
          kota_kabupaten, provinsi, status, 
          created_at, email, no_hp, cabang,
          thn_lulus, alumni
        `)

      // Apply search filter
      if (q && q.trim()) {
        const searchTerm = q.trim()
        query = query.or(`
          nama.ilike.%${searchTerm}%,
          npa.ilike.%${searchTerm}%,
          tempat_tugas.ilike.%${searchTerm}%,
          kota_kabupaten.ilike.%${searchTerm}%,
          provinsi.ilike.%${searchTerm}%,
          alumni.ilike.%${searchTerm}%
        `)
      }

      // Apply filters
      if (provinsi) {
        query = query.ilike('provinsi', `%${provinsi}%`)
      }

      if (pd) {
        query = query.ilike('cabang', `%${pd}%`)
      }

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

      // Get total count first
      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // Apply pagination
      const pageNum = page || 1
      const limitNum = limit || 25
      const offset = (pageNum - 1) * limitNum

      // Get paginated results
      const { data, error } = await query
        .range(offset, offset + limitNum - 1)

      if (error) {
        console.error('Database error:', error)
        return { error: 'Database error' }
      }

      // Transform data for compatibility
      const transformedData = data?.map(member => ({
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
      console.error('API error:', error)
      return { error: 'Internal server error' }
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
}