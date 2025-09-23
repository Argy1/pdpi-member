import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';

interface IndonesiaMapProps {
  members: Member[];
}

// Indonesia province coordinates (simplified for visualization)
const PROVINCE_COORDINATES = {
  'Aceh': { x: 8, y: 15 },
  'Sumatera Utara': { x: 12, y: 20 },
  'Sumatera Barat': { x: 12, y: 28 },
  'Riau': { x: 18, y: 25 },
  'Kepulauan Riau': { x: 22, y: 30 },
  'Jambi': { x: 18, y: 32 },
  'Sumatera Selatan': { x: 18, y: 38 },
  'Bangka Belitung': { x: 22, y: 36 },
  'Bengkulu': { x: 15, y: 40 },
  'Lampung': { x: 18, y: 45 },
  'DKI Jakarta': { x: 25, y: 48 },
  'Jawa Barat': { x: 28, y: 50 },
  'Jawa Tengah': { x: 35, y: 52 },
  'DI Yogyakarta': { x: 35, y: 54 },
  'Jawa Timur': { x: 42, y: 52 },
  'Banten': { x: 23, y: 50 },
  'Bali': { x: 48, y: 55 },
  'Nusa Tenggara Barat': { x: 52, y: 55 },
  'Nusa Tenggara Timur': { x: 58, y: 58 },
  'Kalimantan Barat': { x: 30, y: 25 },
  'Kalimantan Tengah': { x: 38, y: 30 },
  'Kalimantan Selatan': { x: 40, y: 35 },
  'Kalimantan Timur': { x: 48, y: 28 },
  'Kalimantan Utara': { x: 45, y: 20 },
  'Sulawesi Utara': { x: 58, y: 18 },
  'Sulawesi Tengah': { x: 55, y: 28 },
  'Sulawesi Selatan': { x: 55, y: 38 },
  'Sulawesi Tenggara': { x: 60, y: 42 },
  'Gorontalo': { x: 58, y: 22 },
  'Sulawesi Barat': { x: 52, y: 35 },
  'Maluku': { x: 70, y: 38 },
  'Maluku Utara': { x: 68, y: 25 },
  'Papua Barat': { x: 75, y: 35 },
  'Papua': { x: 85, y: 40 },
  'Papua Tengah': { x: 82, y: 42 },
  'Papua Pegunungan': { x: 88, y: 38 },
  'Papua Selatan': { x: 85, y: 45 },
  'Papua Barat Daya': { x: 78, y: 42 }
};

export function IndonesiaMap({ members }: IndonesiaMapProps) {
  const mapData = useMemo(() => {
    // Count members by province
    const provinceCount = members.reduce((acc, member) => {
      const provinsi = member.provinsi || 'Tidak Diketahui';
      acc[provinsi] = (acc[provinsi] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count members by branch/cabang
    const branchCount = members.reduce((acc, member) => {
      const cabang = member.cabang || member.pd || 'Tidak Diketahui';
      acc[cabang] = (acc[cabang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get total count
    const totalMembers = members.length;

    // Create map points for provinces with known coordinates
    const mapPoints = Object.entries(provinceCount)
      .filter(([province]) => PROVINCE_COORDINATES[province as keyof typeof PROVINCE_COORDINATES])
      .map(([province, count]) => ({
        province,
        count,
        coordinates: PROVINCE_COORDINATES[province as keyof typeof PROVINCE_COORDINATES],
        color: count > 50 ? '#10b981' : count > 10 ? '#f59e0b' : '#ef4444',
        size: Math.max(20, Math.min(60, count * 2))
      }));

    return {
      provinceCount,
      branchCount,
      totalMembers,
      mapPoints
    };
  }, [members]);

  const getCircleSize = (count: number) => {
    if (count > 50) return 'w-8 h-8 text-sm';
    if (count > 10) return 'w-6 h-6 text-xs';
    return 'w-5 h-5 text-xs';
  };

  const getCircleColor = (count: number) => {
    if (count > 50) return 'bg-green-500 text-white';
    if (count > 10) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Peta Sebaran Dokter Spesialis Paru di Indonesia</CardTitle>
            <CardDescription>
              Distribusi anggota PDPI berdasarkan provinsi (Update: {new Date().toLocaleDateString('id-ID')} | Total: {mapData.totalMembers.toLocaleString('id-ID')} Sp.P)
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>1-10</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>11-50</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>&gt; 50</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg border">
          {/* Indonesia silhouette background */}
          <div className="absolute inset-0 opacity-20">
            <svg
              viewBox="0 0 100 60"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
            >
              {/* Simplified Indonesia map outline */}
              <path
                d="M5 15 L15 10 L25 12 L35 8 L45 10 L55 12 L65 15 L75 18 L85 20 L90 25 L92 35 L88 45 L82 50 L75 52 L65 50 L55 48 L45 45 L35 42 L25 40 L15 35 L8 28 L5 20 Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
              <path
                d="M20 45 L30 42 L40 40 L50 38 L55 40 L58 45 L55 50 L50 52 L40 50 L30 48 L20 45 Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
              <path
                d="M25 25 L35 22 L45 20 L50 25 L48 35 L42 38 L35 35 L28 32 L25 25 Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
              <path
                d="M52 15 L62 12 L68 15 L72 20 L70 30 L65 35 L58 32 L52 28 L50 20 L52 15 Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
              <path
                d="M68 25 L78 22 L85 28 L88 35 L85 42 L78 45 L70 42 L68 35 L70 30 L68 25 Z"
                fill="currentColor"
                className="text-muted-foreground"
              />
            </svg>
          </div>

          {/* Province markers */}
          {mapData.mapPoints.map(({ province, count, coordinates }) => (
            <div
              key={province}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
              style={{
                left: `${coordinates.x}%`,
                top: `${coordinates.y}%`,
              }}
            >
              <div
                className={`
                  ${getCircleSize(count)}
                  ${getCircleColor(count)}
                  rounded-full flex items-center justify-center font-bold
                  shadow-lg hover:scale-110 transition-transform duration-200
                  border-2 border-white
                `}
                title={`${province}: ${count} anggota`}
              >
                {count}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                {province}: {count} Sp.P
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics below map */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(mapData.provinceCount).filter(count => count > 50).length}
            </div>
            <div className="text-sm text-muted-foreground">Provinsi dengan &gt;50 anggota</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(mapData.provinceCount).filter(count => count > 10 && count <= 50).length}
            </div>
            <div className="text-sm text-muted-foreground">Provinsi dengan 11-50 anggota</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(mapData.provinceCount).filter(count => count <= 10).length}
            </div>
            <div className="text-sm text-muted-foreground">Provinsi dengan 1-10 anggota</div>
          </div>
        </div>

        {/* Top branches */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Cabang/PD Terbesar:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mapData.branchCount)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([branch, count]) => (
                <Badge key={branch} variant="outline" className="px-3 py-1">
                  {branch}: {count}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}