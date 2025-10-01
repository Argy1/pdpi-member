import { supabase } from '@/integrations/supabase/client'

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
      // Build base query
      let query = supabase.from('members').select('*', { count: 'exact' })

      // Apply filters
      query = this.applyFilters(query, params)

      const { data: members, error, count } = await query

      if (error) throw error

      const total = count || 0
      const laki = members?.filter(m => m.jenis_kelamin === 'L').length || 0
      const perempuan = members?.filter(m => m.jenis_kelamin === 'P').length || 0

      // Group by provinsi
      const provinsiMap = new Map<string, number>()
      members?.forEach(m => {
        const prov = m.provinsi_kantor || 'Tidak Diketahui'
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
    try {
      let query = supabase.from('members').select('provinsi_kantor, jenis_kelamin')

      query = this.applyFilters(query, params)

      const { data: members, error } = await query

      if (error) throw error

      // Group by provinsi with gender breakdown
      const provinsiMap = new Map<string, { count: number; laki: number; perempuan: number }>()
      
      members?.forEach(m => {
        const prov = m.provinsi_kantor || 'Tidak Diketahui'
        const current = provinsiMap.get(prov) || { count: 0, laki: 0, perempuan: 0 }
        current.count++
        if (m.jenis_kelamin === 'L') current.laki++
        if (m.jenis_kelamin === 'P') current.perempuan++
        provinsiMap.set(prov, current)
      })

      return Array.from(provinsiMap.entries())
        .map(([provinsi, stats]) => ({
          provinsi,
          count: stats.count,
          laki: stats.laki,
          perempuan: stats.perempuan
        }))
        .sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('Error fetching province stats:', error)
      return []
    }
  }

  private static applyFilters(query: any, params: StatsParams) {
    const { q, provinsi, pd, kota, status, gender } = params

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

    if (status) {
      query = query.eq('status', status)
    }

    if (gender) {
      query = query.eq('jenis_kelamin', gender)
    }

    return query
  }
}
