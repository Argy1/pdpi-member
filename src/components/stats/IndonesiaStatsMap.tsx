import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp } from "lucide-react"
import { ProvinceStats } from "@/pages/api/StatsAPI"
import { IndonesiaMap } from "@/components/sebaran/IndonesiaMap"

interface IndonesiaStatsMapProps {
  data: ProvinceStats[]
  loading?: boolean
  filters?: {
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }
}

export function IndonesiaStatsMap({ data, loading, filters = {} }: IndonesiaStatsMapProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Peta Sebaran Anggota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[68vh] min-h-[500px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 animate-pulse rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  // Calculate statistics
  const totalMembers = data.reduce((sum, d) => sum + d.count, 0)
  const totalLaki = data.reduce((sum, d) => sum + d.laki, 0)
  const totalPerempuan = data.reduce((sum, d) => sum + d.perempuan, 0)
  const maxCount = Math.max(...data.map(d => d.count), 1)

  // Top 5 provinces
  const top5 = data.slice(0, 5)

  return (
    <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Peta Sebaran Anggota
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <IndonesiaMap filters={filters} />
      </CardContent>
    </Card>
  )
}
