import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { ProvinceStats } from "@/pages/api/StatsAPI"

interface IndonesiaStatsMapProps {
  data: ProvinceStats[]
  loading?: boolean
}

export function IndonesiaStatsMap({ data, loading }: IndonesiaStatsMapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Peta Sebaran Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // Find max count for color scaling
  const maxCount = Math.max(...data.map(d => d.count), 1)

  const getColorIntensity = (count: number) => {
    const intensity = Math.round((count / maxCount) * 100)
    return intensity
  }

  const getMarkerSize = (count: number) => {
    if (count === 0) return 0
    if (count < 10) return 20
    if (count < 50) return 30
    if (count < 100) return 40
    if (count < 500) return 50
    return 60
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Peta Sebaran Anggota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg p-8 min-h-[500px]">
          <div className="text-center space-y-4">
            <div className="inline-block p-8 bg-background/80 backdrop-blur rounded-lg shadow-lg">
              <MapPin className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Visualisasi Peta Indonesia</h3>
              <p className="text-muted-foreground mb-4">
                Menampilkan distribusi {data.reduce((sum, d) => sum + d.count, 0).toLocaleString('id-ID')} anggota
                <br />di {data.length} provinsi
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                <div className="space-y-2">
                  <p className="font-semibold">Top 5 Provinsi:</p>
                  {data.slice(0, 5).map((prov, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span>{prov.provinsi}</span>
                      <span className="font-bold ml-2">{prov.count}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Distribusi Gender:</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Laki-laki:</span>
                      <span className="font-bold">{data.reduce((sum, d) => sum + d.laki, 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perempuan:</span>
                      <span className="font-bold">{data.reduce((sum, d) => sum + d.perempuan, 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Peta interaktif dengan Leaflet akan dimuat di sini
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
