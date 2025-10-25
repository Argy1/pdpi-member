import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useStats } from "@/hooks/useStats"
import { StatsFilters } from "@/components/stats/StatsFilters"
import { StatsSummaryCards } from "@/components/stats/StatsSummaryCards"
import { GenderChart } from "@/components/stats/GenderChart"
import { DistributionTable } from "@/components/stats/DistributionTable"
import { IndonesiaStatsMap } from "@/components/stats/IndonesiaStatsMap"
import { TipeRSView } from "@/components/sebaran/TipeRSView"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Users } from "lucide-react"
import { StatsAPI } from "@/pages/api/StatsAPI"
import { exportMembersToExcel, getExportFilename } from "@/utils/exportMembers"
import { useToast } from "@/hooks/use-toast"

export default function SebaranPage() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExporting, setIsExporting] = useState(false)
  
  const [filters, setFilters] = useState<{
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }>({
    q: searchParams.get('q') || undefined,
    provinsi: searchParams.get('provinsi') || undefined,
    pd: searchParams.get('pd') || undefined,
    kota: searchParams.get('kota') || undefined,
    status: searchParams.get('status') || undefined,
    gender: searchParams.get('gender') || undefined,
  })

  const { summary, provinceStats, loading, error, refresh } = useStats(filters)
  const [allProvinces, setAllProvinces] = useState<string[]>([])

  // Load all 39 provinces from centroids for complete filter list
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch('/geo/centroids-provinces.json', { cache: 'no-store' })
        const centroids = await response.json()
        const provinceNames = centroids
          .map((c: any) => c.provinsi)
          .filter((p: string) => p !== 'Kepulauan Bangka Belitung') // Remove duplicate
          .sort((a: string, b: string) => a.localeCompare(b, 'id'))
        setAllProvinces(provinceNames)
      } catch (error) {
        console.error('Failed to load provinces:', error)
        // Fallback to summary data if centroids fail to load
        setAllProvinces(summary?.byProvinsi.map(p => p.provinsi).filter(p => p !== 'Tidak Diketahui') || [])
      }
    }
    loadProvinces()
  }, [])

  // Extract PDs and cities from summary for filter options
  const provinces = allProvinces.length > 0 ? allProvinces : (summary?.byProvinsi.map(p => p.provinsi).filter(p => p !== 'Tidak Diketahui') || [])
  const pds = summary?.byCabang.map(c => c.pd).filter(pd => pd !== 'Tidak Diketahui') || []
  const cities = summary?.byKota.map(k => k.kota).filter(k => k !== 'Tidak Diketahui') || []

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.provinsi) params.set('provinsi', filters.provinsi)
    if (filters.pd) params.set('pd', filters.pd)
    if (filters.kota) params.set('kota', filters.kota)
    if (filters.status) params.set('status', filters.status)
    if (filters.gender) params.set('gender', filters.gender)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Auto-refresh when filters change
  useEffect(() => {
    refresh()
  }, [filters])

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setIsExporting(true)
    try {
      toast({
        title: "Mengunduh data...",
        description: "Mohon tunggu, sedang mempersiapkan file export.",
      })

      // Fetch all members with current filters
      const members = await StatsAPI.getAllMembersForExport(filters)
      
      if (members.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada anggota yang sesuai dengan filter yang dipilih.",
          variant: "destructive",
        })
        return
      }

      // Generate filename based on filters
      const filename = getExportFilename(filters)

      // Export to Excel/CSV
      exportMembersToExcel(members, { format, filename })

      toast({
        title: "Berhasil!",
        description: `Data ${members.length.toLocaleString('id-ID')} anggota berhasil diexport ke ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Gagal export",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat export data.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-sky-50 dark:from-slate-950 dark:via-teal-950/20 dark:to-sky-950/20">
      {/* Hero Header */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Sebaran Anggota PDPI
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualisasi distribusi anggota berdasarkan provinsi, cabang, dan kota/kabupaten di seluruh Indonesia
              </p>
            </div>
            <Badge 
              variant="secondary" 
              className="self-start md:self-center px-6 py-3 text-lg rounded-2xl shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border-2 border-teal-500/20"
            >
              <Users className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
              {summary?.total.toLocaleString('id-ID') || '0'} Anggota
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <StatsFilters
        filters={filters}
        onFiltersChange={setFilters}
        provinces={provinces}
        pds={pds}
        cities={cities}
        loading={loading}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <StatsSummaryCards
              total={summary?.total || 0}
              laki={summary?.laki || 0}
              perempuan={summary?.perempuan || 0}
              loading={loading}
            />
          </div>

          {/* Main Grid: Map + Sidebar */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Map Column */}
            <div className="lg:col-span-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <IndonesiaStatsMap
                data={provinceStats}
                loading={loading}
                filters={filters}
              />
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Gender Chart */}
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <GenderChart
                  laki={summary?.laki || 0}
                  perempuan={summary?.perempuan || 0}
                  loading={loading}
                />
              </div>

              {/* Distribution Tables */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <DistributionTable
                    title="Distribusi Per Provinsi"
                    data={summary?.byProvinsi.map(p => ({
                      name: p.provinsi,
                      count: p.count
                    })) || []}
                    loading={loading}
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
                  <DistributionTable
                    title="Distribusi Per Cabang/PD"
                    data={summary?.byCabang.map(c => ({
                      name: c.pd,
                      count: c.count
                    })) || []}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cities Table - Full Width */}
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <DistributionTable
              title="Distribusi Per Kota/Kabupaten"
              data={summary?.byKota.map(k => ({
                name: k.kota,
                count: k.count,
                subtitle: k.provinsi
              })) || []}
              loading={loading}
            />
          </div>

          {/* Tipe RS View - Filter by Hospital Type */}
          <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
            <TipeRSView filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}
