import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp } from "lucide-react"
import { ProvinceStats } from "@/pages/api/StatsAPI"
// Temporarily disabled due to React Leaflet context issue
// import { IndonesiaMap } from "@/components/sebaran/IndonesiaMap"

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
      <CardContent>
        <div className="relative bg-gradient-to-br from-teal-50 via-emerald-50 to-sky-50 dark:from-teal-950/30 dark:via-emerald-950/30 dark:to-sky-950/30 rounded-2xl p-8 min-h-[68vh] overflow-hidden border-2 border-slate-200 dark:border-slate-800">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -z-0" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
            {/* Icon */}
            <div className="p-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl shadow-2xl">
              <MapPin className="h-20 w-20 text-white" />
            </div>

            {/* Main Info */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Visualisasi Peta Indonesia
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                Menampilkan distribusi <span className="font-semibold text-teal-600 dark:text-teal-400">{totalMembers.toLocaleString('id-ID')}</span> anggota
                di <span className="font-semibold text-emerald-600 dark:text-emerald-400">{data.length}</span> provinsi
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-6">
              {/* Top 5 Provinces */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Top 5 Provinsi</h4>
                </div>
                <div className="space-y-3">
                  {top5.map((prov, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm group">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-teal-500 text-teal-700 dark:text-teal-400">
                          {idx + 1}
                        </Badge>
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {prov.provinsi}
                        </span>
                      </div>
                      <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold rounded-full">
                        {prov.count.toLocaleString('id-ID')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Distribusi Gender</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Laki-laki</span>
                      <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold rounded-full">
                        {totalLaki.toLocaleString('id-ID')}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalMembers > 0 ? (totalLaki / totalMembers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Perempuan</span>
                      <Badge className="bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-semibold rounded-full">
                        {totalPerempuan.toLocaleString('id-ID')}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-pink-400 to-rose-400 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalMembers > 0 ? (totalPerempuan / totalMembers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Enhancement Note */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md leading-relaxed">
              Peta interaktif dengan React Leaflet sedang dalam perbaikan. Sementara waktu, gunakan statistik di samping untuk melihat distribusi anggota.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
