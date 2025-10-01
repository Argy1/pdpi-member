import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"

interface StatsSummaryCardsProps {
  total: number
  laki: number
  perempuan: number
  loading?: boolean
}

export function StatsSummaryCards({ total, laki, perempuan, loading }: StatsSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 rounded-2xl animate-pulse bg-white/70 dark:bg-slate-900/60 backdrop-blur">
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </Card>
        ))}
      </div>
    )
  }

  const lakiPercentage = total > 0 ? ((laki / total) * 100).toFixed(1) : '0'
  const perempuanPercentage = total > 0 ? ((perempuan / total) * 100).toFixed(1) : '0'

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Card */}
      <Card className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Anggota</p>
            <p className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 leading-none">
              {total.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Jumlah keseluruhan
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Users className="h-7 w-7" />
          </div>
        </div>
      </Card>

      {/* Laki-laki Card */}
      <Card className="group p-6 rounded-2xl border-2 border-teal-200 dark:border-teal-900 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Laki-laki</p>
            <p className="text-3xl md:text-4xl font-semibold text-teal-900 dark:text-teal-100 leading-none">
              {laki.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400 leading-relaxed">
              {lakiPercentage}% dari total
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 dark:from-teal-600 dark:to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
            <UserCheck className="h-7 w-7" />
          </div>
        </div>
      </Card>

      {/* Perempuan Card */}
      <Card className="group p-6 rounded-2xl border-2 border-pink-200 dark:border-pink-900 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-pink-700 dark:text-pink-400">Perempuan</p>
            <p className="text-3xl md:text-4xl font-semibold text-pink-900 dark:text-pink-100 leading-none">
              {perempuan.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-pink-600 dark:text-pink-400 leading-relaxed">
              {perempuanPercentage}% dari total
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 dark:from-pink-500 dark:to-rose-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
            <UserX className="h-7 w-7" />
          </div>
        </div>
      </Card>
    </div>
  )
}
