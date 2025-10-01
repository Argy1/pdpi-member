import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"
import { StatCard } from "@/components/StatCard"

interface StatsSummaryCardsProps {
  total: number
  laki: number
  perempuan: number
  loading?: boolean
}

export function StatsSummaryCards({ total, laki, perempuan, loading }: StatsSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  const lakiPercentage = total > 0 ? ((laki / total) * 100).toFixed(1) : '0'
  const perempuanPercentage = total > 0 ? ((perempuan / total) * 100).toFixed(1) : '0'

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Anggota"
        value={total.toLocaleString('id-ID')}
        description="Jumlah keseluruhan anggota"
        icon={Users}
      />
      <StatCard
        title="Laki-laki"
        value={laki.toLocaleString('id-ID')}
        description={`${lakiPercentage}% dari total anggota`}
        icon={UserCheck}
      />
      <StatCard
        title="Perempuan"
        value={perempuan.toLocaleString('id-ID')}
        description={`${perempuanPercentage}% dari total anggota`}
        icon={UserX}
      />
    </div>
  )
}
