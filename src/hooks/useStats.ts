import { useState, useEffect } from 'react'
import { StatsAPI, StatsSummary, ProvinceStats } from '@/pages/api/StatsAPI'

interface StatsParams {
  q?: string
  provinsi?: string
  pd?: string
  kota?: string
  status?: string
  gender?: string
}

interface UseStatsResult {
  summary: StatsSummary | null
  provinceStats: ProvinceStats[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useStats(params: StatsParams = {}): UseStatsResult {
  const [summary, setSummary] = useState<StatsSummary | null>(null)
  const [provinceStats, setProvinceStats] = useState<ProvinceStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Force no-cache fetch to ensure fresh data
        const [summaryData, provinceData] = await Promise.all([
          StatsAPI.getSummary(params),
          StatsAPI.getProvinceStats(params)
        ])
        
        console.log('Stats Summary fetched:', {
          total: summaryData.total,
          provinceCount: summaryData.byProvinsi.length,
          provinces: summaryData.byProvinsi.map(p => p.provinsi),
          cities: summaryData.byKota.slice(0, 10).map(k => ({ kota: k.kota, provinsi: k.provinsi }))
        })
        
        setSummary(summaryData)
        setProvinceStats(provinceData)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [
    params.q, 
    params.provinsi, 
    params.pd, 
    params.kota, 
    params.status, 
    params.gender, 
    refreshKey
  ])

  const refresh = () => {
    console.log('Forcing stats refresh...')
    setRefreshKey(prev => prev + 1)
  }

  return { summary, provinceStats, loading, error, refresh }
}
