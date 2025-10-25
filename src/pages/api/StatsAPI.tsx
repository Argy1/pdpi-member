import { supabase } from '@/integrations/supabase/client'
import { Member } from '@/types/member'

export interface StatsSummary {
  total: number
  laki: number
  perempuan: number
  byProvinsi: Array<{ provinsi: string; count: number }>
  byCabang: Array<{ pd: string; count: number }>
  byKota: Array<{ kota: string; provinsi: string; count: number }>
}

export interface ProvinceStats {
  provinsi: string
  count: number
  laki: number
  perempuan: number
  lat?: number
  lng?: number
}

interface StatsParams {
  q?: string
  provinsi?: string
  pd?: string
  kota?: string
  status?: string
  gender?: string
}

export class StatsAPI {
  static async getSummary(params: StatsParams = {}): Promise<StatsSummary> {
    try {
      // Import normalizer
      const { normalizeProvinsi } = await import('@/utils/provinceNormalizer')

      // Build base query with specific fields needed - get ALL members without limit
      let query = supabase.from('members').select('jenis_kelamin, provinsi_kantor, cabang, kota_kabupaten_kantor', { count: 'exact' })

      // Apply filters
      query = this.applyFilters(query, params)
      
      // Set very high limit to ensure we get all members
      query = query.limit(100000)

      const { data: members, error, count } = await query

      if (error) throw error

      const total = count || 0
      const laki = members?.filter(m => m.jenis_kelamin === 'L').length || 0
      const perempuan = members?.filter(m => m.jenis_kelamin === 'P').length || 0

      // Group by provinsi with normalization
      const provinsiMap = new Map<string, number>()
      members?.forEach(m => {
        const rawProv = m.provinsi_kantor || 'Tidak Diketahui'
        const prov = rawProv === 'Tidak Diketahui' ? rawProv : normalizeProvinsi(rawProv)
        provinsiMap.set(prov, (provinsiMap.get(prov) || 0) + 1)
      })
      const byProvinsi = Array.from(provinsiMap.entries())
        .map(([provinsi, count]) => ({ provinsi, count }))
        .sort((a, b) => b.count - a.count)

      // Group by cabang/PD
      const cabangMap = new Map<string, number>()
      members?.forEach(m => {
        const pd = m.cabang || 'Tidak Diketahui'
        cabangMap.set(pd, (cabangMap.get(pd) || 0) + 1)
      })
      const byCabang = Array.from(cabangMap.entries())
        .map(([pd, count]) => ({ pd, count }))
        .sort((a, b) => b.count - a.count)

      // Group by kota
      const kotaMap = new Map<string, { count: number; provinsi: string }>()
      members?.forEach(m => {
        const kota = m.kota_kabupaten_kantor || 'Tidak Diketahui'
        const provinsi = m.provinsi_kantor || 'Tidak Diketahui'
        const current = kotaMap.get(kota) || { count: 0, provinsi }
        kotaMap.set(kota, { count: current.count + 1, provinsi })
      })
      const byKota = Array.from(kotaMap.entries())
        .map(([kota, data]) => ({ kota, provinsi: data.provinsi, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 500) // Limit to top 500

      return {
        total,
        laki,
        perempuan,
        byProvinsi,
        byCabang,
        byKota
      }
    } catch (error) {
      console.error('Error fetching stats summary:', error)
      return {
        total: 0,
        laki: 0,
        perempuan: 0,
        byProvinsi: [],
        byCabang: [],
        byKota: []
      }
    }
  }

  static async getProvinceStats(params: StatsParams = {}): Promise<ProvinceStats[]> {
    let query = supabase
      .from('members')
      .select('provinsi_kantor, jenis_kelamin')

    query = this.applyFilters(query, params)
    
    // Set very high limit to ensure we get all members
    query = query.limit(100000)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    // Import normalizer
    const { normalizeProvinsi } = await import('@/utils/provinceNormalizer')

    // Group by province with normalization
    const provinceMap = new Map<string, { count: number; laki: number; perempuan: number }>()
    
    data?.forEach(member => {
      // Normalize province name to handle duplicates like "JAWA TIMUR" vs "Jawa Timur"
      const rawProv = member.provinsi_kantor || 'Tidak Diketahui'
      const prov = rawProv === 'Tidak Diketahui' ? rawProv : normalizeProvinsi(rawProv)
      const current = provinceMap.get(prov) || { count: 0, laki: 0, perempuan: 0 }
      
      current.count++
      if (member.jenis_kelamin === 'L') current.laki++
      if (member.jenis_kelamin === 'P') current.perempuan++
      
      provinceMap.set(prov, current)
    })

    const provinceStats: ProvinceStats[] = Array.from(provinceMap.entries())
      .map(([provinsi, stats]) => ({
        provinsi,
        count: stats.count,
        laki: stats.laki,
        perempuan: stats.perempuan
      }))
      .sort((a, b) => b.count - a.count)

    return provinceStats
  }

  static async getCentroids(params: StatsParams = {}): Promise<Array<{
    provinsi: string
    lat: number
    lng: number
    total: number
    laki: number
    perempuan: number
  }>> {
    try {
      // Fetch centroids data - always return all 38 provinces
      const centroidsRes = await fetch('/geo/centroids-provinces.json', { cache: 'no-store' })
      const centroids = await centroidsRes.json()

      // Fetch member data with all needed fields
      let query = supabase
        .from('members')
        .select('provinsi, provinsi_kantor, kota_kabupaten, kota_kabupaten_kantor, jenis_kelamin')

      query = this.applyFilters(query, params)
      
      // Set very high limit to ensure we get all members
      query = query.limit(100000)

      const { data, error } = await query

      if (error) throw new Error(error.message)

      // Dynamically import normalization utilities
      const { normalizeProvinsi, inferProvFromKota } = await import('@/utils/provinceNormalizer')

      // Group by province with normalization and inference
      const provinceMap = new Map<string, { total: number; laki: number; perempuan: number }>()
      
      for (const member of data || []) {
        // Try multiple sources for province
        let provFinal = normalizeProvinsi(member.provinsi)
        
        if (!provFinal) {
          provFinal = normalizeProvinsi(member.provinsi_kantor)
        }
        
        if (!provFinal) {
          provFinal = await inferProvFromKota(member.kota_kabupaten)
        }
        
        if (!provFinal) {
          provFinal = await inferProvFromKota(member.kota_kabupaten_kantor)
        }
        
        if (!provFinal) continue
        
        const current = provinceMap.get(provFinal) || { total: 0, laki: 0, perempuan: 0 }
        current.total++
        if (member.jenis_kelamin === 'L') current.laki++
        if (member.jenis_kelamin === 'P') current.perempuan++
        
        provinceMap.set(provFinal, current)
      }

      // Merge with centroids - ALWAYS return all provinces, even with total=0
      const result = centroids
        .map((centroid: any) => {
          const stats = provinceMap.get(centroid.provinsi) || { total: 0, laki: 0, perempuan: 0 }
          return {
            provinsi: centroid.provinsi,
            lat: centroid.lat,
            lng: centroid.lng,
            total: stats.total,
            laki: stats.laki,
            perempuan: stats.perempuan
          }
        })
        // Only filter to show markers with data, but return all for the endpoint
        .sort((a: any, b: any) => b.total - a.total)

      return result
    } catch (err) {
      console.error('Error fetching centroids:', err)
      // Return empty centroids structure on error
      try {
        const centroidsRes = await fetch('/geo/centroids-provinces.json', { cache: 'no-store' })
        const centroids = await centroidsRes.json()
        return centroids.map((c: any) => ({ ...c, total: 0, laki: 0, perempuan: 0 }))
      } catch {
        return []
      }
    }
  }

  private static applyFilters(query: any, params: StatsParams) {
    const { q, provinsi, pd, kota, status, gender } = params

    // By default, exclude "Luar Biasa", "Meninggal", "Muda" statuses to match member table
    if (!status) {
      query = query.not('status', 'in', '("Luar Biasa","Meninggal","Muda")')
    } else if (status) {
      query = query.eq('status', status)
    }

    if (q && q.trim()) {
      const searchTerm = q.trim()
      query = query.or([
        `nama.ilike.%${searchTerm}%`,
        `npa.ilike.%${searchTerm}%`,
        `tempat_tugas.ilike.%${searchTerm}%`,
        `kota_kabupaten_kantor.ilike.%${searchTerm}%`,
        `provinsi_kantor.ilike.%${searchTerm}%`,
        `cabang.ilike.%${searchTerm}%`,
        `alumni.ilike.%${searchTerm}%`
      ].join(','))
    }

    if (provinsi) {
      const provinces = provinsi.split(',').map(p => p.trim()).filter(p => p)
      if (provinces.length > 0) {
        query = query.or(provinces.map(p => `provinsi_kantor.ilike.%${p}%`).join(','))
      }
    }

    if (pd) {
      const pds = pd.split(',').map(p => p.trim()).filter(p => p)
      if (pds.length > 0) {
        query = query.or(pds.map(p => `cabang.ilike.%${p}%`).join(','))
      }
    }

    if (kota) {
      const cities = kota.split(',').map(c => c.trim()).filter(c => c)
      if (cities.length > 0) {
        query = query.or(cities.map(c => `kota_kabupaten_kantor.ilike.%${c}%`).join(','))
      }
    }

    if (gender) {
      query = query.eq('jenis_kelamin', gender)
    }

    return query
  }

  static async getAllMembersForExport(params: StatsParams = {}): Promise<any[]> {
    try {
      // Build query with all fields needed for export
      let query = supabase
        .from('members')
        .select('*')

      // Apply the same filters as stats
      query = this.applyFilters(query, params)

      // Order by name
      query = query.order('nama', { ascending: true })

      // Get all results (no pagination for export)
      const { data, error } = await query

      if (error) {
        console.error('Error fetching members for export:', error)
        throw new Error(`Failed to fetch members: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllMembersForExport:', error)
      throw error
    }
  }
}
