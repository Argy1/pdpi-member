import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

interface DistributionData {
  name: string
  count: number
  subtitle?: string
}

interface DistributionTableProps {
  title: string
  data: DistributionData[]
  loading?: boolean
  limit?: number
}

export function DistributionTable({ title, data, loading, limit = 10 }: DistributionTableProps) {
  const displayData = data.slice(0, limit)

  return (
    <Card className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-xl hover:shadow-2xl transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : displayData.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 text-sm">Tidak ada data</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900/80 backdrop-blur z-10">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[50px] font-semibold text-slate-700 dark:text-slate-300">No</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nama</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item, index) => (
                  <TableRow 
                    key={index}
                    className="border-slate-200 dark:border-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                      <Link to={`/anggota?${item.subtitle ? `provinsi=${item.subtitle}&kota=${item.name}` : `provinsi=${item.name}`}`} className="block">
                        {index + 1}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/anggota?${item.subtitle ? `provinsi=${item.subtitle}&kota=${item.name}` : `provinsi=${item.name}`}`} className="block">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                          {item.subtitle && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</div>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/anggota?${item.subtitle ? `provinsi=${item.subtitle}&kota=${item.name}` : `provinsi=${item.name}`}`} className="block">
                        <Badge 
                          variant="secondary" 
                          className="rounded-full px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold"
                        >
                          {item.count.toLocaleString('id-ID')}
                        </Badge>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
