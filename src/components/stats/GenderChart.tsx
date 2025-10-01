import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GenderChartProps {
  laki: number
  perempuan: number
}

export function GenderChart({ laki, perempuan }: GenderChartProps) {
  const data = [
    { name: 'Laki-laki', value: laki, color: 'hsl(var(--chart-1))' },
    { name: 'Perempuan', value: perempuan, color: 'hsl(var(--chart-2))' }
  ]

  const total = laki + perempuan

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value} (${total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
