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
        
        const [summaryData, provinceData] = await Promise.all([
          StatsAPI.getSummary(params),
          StatsAPI.getProvinceStats(params)
        ])
        
        setSummary(summaryData)
        setProvinceStats(provinceData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [params.q, params.provinsi, params.pd, params.kota, params.status, params.gender, refreshKey])

  const refresh = () => setRefreshKey(prev => prev + 1)

  return { summary, provinceStats, loading, error, refresh }
}
