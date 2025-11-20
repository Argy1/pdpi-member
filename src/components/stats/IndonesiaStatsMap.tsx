import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { ProvinceStats } from "@/pages/api/StatsAPI"
import IndonesiaMap from "@/components/sebaran/IndonesiaMap"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  
  if (loading) {
    return (
      <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            {t('sebaran.mapTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[68vh] min-h-[500px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 animate-pulse rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          {t('sebaran.mapTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative">
        {/* Legend */}
        <div className="absolute top-2 right-2 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">1 – 10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">11 – 50</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">&gt; 50</span>
            </div>
          </div>
        </div>
        
        <IndonesiaMap filters={filters} />
      </CardContent>
    </Card>
  )
}
