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

      // Build base query - fetch ALL data using pagination to bypass limits
      const allMembers: any[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from('members')
          .select('nama, jenis_kelamin, provinsi_kantor, provinsi, cabang, kota_kabupaten_kantor, kota_kabupaten', { count: 'exact' })
          .range(from, from + pageSize - 1)

        // CRITICAL: Apply filters to match AnggotaAPI (exclude certain statuses)
        query = this.applyFilters(query, params)

        const { data, error, count } = await query

        if (error) throw error

        if (data && data.length > 0) {
          allMembers.push(...data)
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }

        // Log progress
        console.log(`Fetched ${allMembers.length} members so far...`)
      }

      console.log('Total members fetched from DB:', allMembers.length)

      // Calculate accurate totals from actual data - count ALL members (matching public table)
      const total = allMembers.length
      const laki = allMembers.filter(m => m.jenis_kelamin === 'L').length
      const perempuan = allMembers.filter(m => m.jenis_kelamin === 'P').length
      const unknownGender = allMembers.filter(m => !m.jenis_kelamin || (m.jenis_kelamin !== 'L' && m.jenis_kelamin !== 'P')).length
      
      console.log('Gender breakdown:', { total, laki, perempuan, unknownGender })
      
      // Log warning if there are members with unknown gender
      if (unknownGender > 0) {
        console.warn(`Found ${unknownGender} member(s) with unknown/null gender - these will not appear in gender breakdown`)
      }

      // Group by provinsi with normalization - prioritize provinsi_kantor
      const provinsiMap = new Map<string, number>()
      allMembers.forEach(m => {
        let rawProv = m.provinsi_kantor || m.provinsi || 'Tidak Diketahui'
        const prov = rawProv === 'Tidak Diketahui' ? rawProv : normalizeProvinsi(rawProv)
        
        // Debug logging for ALL Papua provinces (not just those with 'papua' in rawProv)
        if (rawProv.toLowerCase().includes('papua')) {
          console.log('Normalizing Papua province:', { raw: rawProv, normalized: prov, member: m.nama })
        }
        
        provinsiMap.set(prov, (provinsiMap.get(prov) || 0) + 1)
      })
      const byProvinsi = Array.from(provinsiMap.entries())
        .map(([provinsi, count]) => ({ provinsi, count }))
        .sort((a, b) => b.count - a.count)
      
      console.log('Total unique provinces in byProvinsi:', byProvinsi.length)
      console.log('Papua provinces found:', byProvinsi.filter(p => p.provinsi.toLowerCase().includes('papua')))

      // Group by cabang/PD
      const cabangMap = new Map<string, number>()
      allMembers.forEach(m => {
        const pd = m.cabang || 'Tidak Diketahui'
        cabangMap.set(pd, (cabangMap.get(pd) || 0) + 1)
      })
      const byCabang = Array.from(cabangMap.entries())
        .map(([pd, count]) => ({ pd, count }))
        .sort((a, b) => b.count - a.count)

      // Group by kota with normalized province - prioritize provinsi_kantor
      const kotaMap = new Map<string, { count: number; provinsi: string }>()
      allMembers.forEach(m => {
        const kota = m.kota_kabupaten_kantor || m.kota_kabupaten || 'Tidak Diketahui'
        const rawProv = m.provinsi_kantor || m.provinsi || 'Tidak Diketahui'
        const provinsi = rawProv === 'Tidak Diketahui' ? rawProv : normalizeProvinsi(rawProv)
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
    // Fetch ALL data using pagination to bypass Supabase limits
    const allMembers: any[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      let query = supabase
        .from('members')
        .select('provinsi_kantor, jenis_kelamin')
        .range(from, from + pageSize - 1)

      // CRITICAL: Apply filters to match AnggotaAPI (exclude certain statuses)
      query = this.applyFilters(query, params)

      const { data, error } = await query

      if (error) throw new Error(error.message)

      if (data && data.length > 0) {
        allMembers.push(...data)
        from += pageSize
        hasMore = data.length === pageSize
      } else {
        hasMore = false
      }
    }

    console.log('getProvinceStats - Total members fetched:', allMembers.length)

    // Import normalizer
    const { normalizeProvinsi } = await import('@/utils/provinceNormalizer')

    // Group by province with normalization - count ALL members
    const provinceMap = new Map<string, { count: number; laki: number; perempuan: number }>()
    
    allMembers.forEach(member => {
      // Normalize province name to handle duplicates like "JAWA TIMUR" vs "Jawa Timur"
      const rawProv = member.provinsi_kantor || 'Tidak Diketahui'
      const prov = rawProv === 'Tidak Diketahui' ? rawProv : normalizeProvinsi(rawProv)
      const current = provinceMap.get(prov) || { count: 0, laki: 0, perempuan: 0 }
      
      // Count all members
      current.count++
      // Count gender breakdown separately
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
      // Fetch centroids data - always return all provinces
      const centroidsRes = await fetch('/geo/centroids-provinces.json', { cache: 'no-store' })
      const centroids = await centroidsRes.json()

      // Fetch member data with all needed fields using pagination
      const allMembers: any[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from('members')
          .select('provinsi, provinsi_kantor, kota_kabupaten, kota_kabupaten_kantor, jenis_kelamin')
          .range(from, from + pageSize - 1)

        // CRITICAL: Apply filters to match AnggotaAPI (exclude certain statuses)
        query = this.applyFilters(query, params)

        const { data, error } = await query

        if (error) throw new Error(error.message)

        if (data && data.length > 0) {
          allMembers.push(...data)
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      console.log('getCentroids - Total members fetched:', allMembers.length)

      // Dynamically import normalization utilities
      const { normalizeProvinsi } = await import('@/utils/provinceNormalizer')

      // Group by province with normalization - use provinsi_kantor as primary field, count ALL members
      const provinceMap = new Map<string, { total: number; laki: number; perempuan: number }>()
      
      for (const member of allMembers) {
        // CRITICAL: Use provinsi_kantor as PRIMARY source and normalize it
        let provFinal = ''
        
        // Try provinsi_kantor first (most reliable field)
        if (member.provinsi_kantor) {
          const normalized = normalizeProvinsi(member.provinsi_kantor)
          if (normalized && normalized !== '') {
            provFinal = normalized
          }
        }
        
        // Fallback to provinsi field if provinsi_kantor is empty
        if (!provFinal && member.provinsi) {
          const normalized = normalizeProvinsi(member.provinsi)
          if (normalized && normalized !== '') {
            provFinal = normalized
          }
        }
        
        // Debug logging for Papua provinces
        if (member.provinsi_kantor?.toLowerCase().includes('papua') || member.provinsi?.toLowerCase().includes('papua')) {
          console.log('getCentroids - Papua member:', { 
            prov_kantor: member.provinsi_kantor, 
            prov: member.provinsi,
            provFinal,
            gender: member.jenis_kelamin
          })
        }
        
        // Skip if still no province
        if (!provFinal) continue
        
        const current = provinceMap.get(provFinal) || { total: 0, laki: 0, perempuan: 0 }
        // Count all members
        current.total++
        // Count gender breakdown separately
        if (member.jenis_kelamin === 'L') current.laki++
        if (member.jenis_kelamin === 'P') current.perempuan++
        
        provinceMap.set(provFinal, current)
      }

      // Log for debugging
      console.log('getCentroids - Province counts after normalization:', Object.fromEntries(provinceMap))
      console.log('getCentroids - Papua provinces in map:', 
        Array.from(provinceMap.entries())
          .filter(([prov]) => prov.toLowerCase().includes('papua'))
          .map(([prov, stats]) => ({ provinsi: prov, ...stats }))
      )

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
      // Fetch ALL data using pagination
      const allMembers: any[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from('members')
          .select('*')
          .order('nama', { ascending: true })
          .range(from, from + pageSize - 1)

        // CRITICAL: Apply filters to match AnggotaAPI (exclude certain statuses)
        query = this.applyFilters(query, params)

        const { data, error } = await query

        if (error) {
          console.error('Error fetching members for export:', error)
          throw new Error(`Failed to fetch members: ${error.message}`)
        }

        if (data && data.length > 0) {
          allMembers.push(...data)
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      console.log('Export - Total members fetched:', allMembers.length)
      return allMembers
    } catch (error) {
      console.error('Error in getAllMembersForExport:', error)
      throw error
    }
  }
}
