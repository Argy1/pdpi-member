import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Users } from "lucide-react"

interface GenderChartProps {
  laki: number
  perempuan: number
  loading?: boolean
}

export function GenderChart({ laki, perempuan, loading }: GenderChartProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Distribusi Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const data = [
    { name: 'Laki-laki', value: laki, color: 'hsl(var(--chart-1))' },
    { name: 'Perempuan', value: perempuan, color: 'hsl(var(--chart-2))' }
  ]

  const total = laki + perempuan
  const COLORS = ['#14b8a6', '#ec4899'] // teal-500, pink-500

  return (
    <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Distribusi Gender
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value.toLocaleString('id-ID')} (${total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)`}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '8px 12px'
              }}
              formatter={(value: number) => value.toLocaleString('id-ID')}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
