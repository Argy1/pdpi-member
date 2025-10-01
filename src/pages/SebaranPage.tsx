import { useState, useEffect } from "react"
import { useStats } from "@/hooks/useStats"
import { StatsFilters } from "@/components/stats/StatsFilters"
import { StatsSummaryCards } from "@/components/stats/StatsSummaryCards"
import { GenderChart } from "@/components/stats/GenderChart"
import { DistributionTable } from "@/components/stats/DistributionTable"
import { IndonesiaStatsMap } from "@/components/stats/IndonesiaStatsMap"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SebaranPage() {
  const [filters, setFilters] = useState<{
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }>({})

  const { summary, provinceStats, loading, error, refresh } = useStats(filters)

  // Extract unique provinces, PDs, and cities from summary for filter options
  const provinces = summary?.byProvinsi.map(p => p.provinsi).filter(p => p !== 'Tidak Diketahui') || []
  const pds = summary?.byCabang.map(c => c.pd).filter(pd => pd !== 'Tidak Diketahui') || []
  const cities = summary?.byKota.map(k => k.kota).filter(k => k !== 'Tidak Diketahui') || []

  // Auto-refresh when filters change
  useEffect(() => {
    refresh()
  }, [filters])

  if (error) {
    return (
      <div className="container-pdpi py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container-pdpi py-8">
          <h1 className="text-3xl font-bold heading-medical mb-2">Sebaran Anggota</h1>
          <p className="text-muted-foreground">
            Visualisasi distribusi anggota PDPI berdasarkan provinsi, cabang, dan kota/kabupaten
          </p>
        </div>
      </div>

      {/* Filters */}
      <StatsFilters
        filters={filters}
        onFiltersChange={setFilters}
        provinces={provinces}
        pds={pds}
        cities={cities}
      />

      {/* Content */}
      <div className="container-pdpi py-8 space-y-8">
        {/* Summary Cards */}
        <StatsSummaryCards
          total={summary?.total || 0}
          laki={summary?.laki || 0}
          perempuan={summary?.perempuan || 0}
          loading={loading}
        />

        {/* Map */}
        <IndonesiaStatsMap
          data={provinceStats}
          loading={loading}
        />

        {/* Charts and Tables */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gender Chart */}
          <GenderChart
            laki={summary?.laki || 0}
            perempuan={summary?.perempuan || 0}
          />

          {/* Distribution by Provinsi */}
          <DistributionTable
            title="Distribusi per Provinsi"
            data={summary?.byProvinsi.map(p => ({
              name: p.provinsi,
              count: p.count
            })) || []}
            loading={loading}
            limit={10}
          />

          {/* Distribution by Cabang/PD */}
          <DistributionTable
            title="Distribusi per Cabang/PD"
            data={summary?.byCabang.map(c => ({
              name: c.pd,
              count: c.count
            })) || []}
            loading={loading}
            limit={10}
          />

          {/* Distribution by Kota */}
          <DistributionTable
            title="Distribusi per Kota/Kabupaten"
            data={summary?.byKota.map(k => ({
              name: k.kota,
              count: k.count,
              subtitle: k.provinsi
            })) || []}
            loading={loading}
            limit={10}
          />
        </div>
      </div>
    </div>
  )
}
