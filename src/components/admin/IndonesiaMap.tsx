import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';
import indonesiaMapSvg from '@/assets/indonesia-map.svg';

interface IndonesiaMapProps {
  members: Member[];
}

// Indonesia province coordinates (precisely mapped to the SVG map)
const PROVINCE_COORDINATES = {
  // Sumatera
  'Aceh': { x: 13, y: 15 },
  'Sumatera Utara': { x: 16, y: 22 },
  'Sumatera Barat': { x: 13, y: 30 },
  'Riau': { x: 18, y: 28 },
  'Kepulauan Riau': { x: 22, y: 32 },
  'Jambi': { x: 17, y: 35 },
  'Sumatera Selatan': { x: 17, y: 42 },
  'Bangka Belitung': { x: 23, y: 38 },
  'Bengkulu': { x: 14, y: 45 },
  'Lampung': { x: 18, y: 50 },
  'Bandar Lampung': { x: 18, y: 50 },
  
  // Java
  'DKI Jakarta': { x: 26, y: 53 },
  'Jawa Barat': { x: 28, y: 55 },
  'Jawa Tengah': { x: 35, y: 57 },
  'Yogyakarta': { x: 35, y: 59 },
  'DI Yogyakarta': { x: 35, y: 59 },
  'Jawa Timur': { x: 43, y: 57 },
  'JAWA TIMUR': { x: 43, y: 57 },
  'Banten': { x: 24, y: 55 },
  
  // Bali & Nusa Tenggara
  'Bali': { x: 49, y: 62 },
  'Nusa Tenggara Barat': { x: 53, y: 62 },
  'Nusa Tenggara Timur': { x: 62, y: 65 },
  
  // Kalimantan
  'Kalimantan Barat': { x: 30, y: 28 },
  'Kalimantan Tengah': { x: 36, y: 35 },
  'Kalimantan Selatan': { x: 38, y: 42 },
  'Kalimantan Timur': { x: 46, y: 32 },
  'Kalimantan Utara': { x: 44, y: 22 },
  
  // Sulawesi
  'Sulawesi Utara': { x: 59, y: 18 },
  'Gorontalo': { x: 57, y: 22 },
  'Sulawesi Tengah': { x: 56, y: 32 },
  'Sulawesi Barat': { x: 53, y: 42 },
  'Sulawesi Selatan': { x: 56, y: 46 },
  'Sulawesi Tenggara': { x: 63, y: 48 },
  
  // Maluku
  'Maluku': { x: 73, y: 45 },
  'Maluku Utara': { x: 69, y: 28 },
  
  // Papua
  'Papua Barat': { x: 77, y: 42 },
  'Papua Barat Daya': { x: 79, y: 48 },
  'Papua': { x: 88, y: 45 },
  'Papua Tengah': { x: 85, y: 47 },
  'Papua Pegunungan': { x: 91, y: 42 },
  'Papua Selatan': { x: 87, y: 52 },
  
  // Others
  'Maldives': { x: 5, y: 85 }
};

export function IndonesiaMap({ members }: IndonesiaMapProps) {
  const mapData = useMemo(() => {
    // Normalize province names to handle variations
    const normalizeProvince = (province: string | null | undefined): string => {
      if (!province) return 'Tidak Diketahui';
      
      const normalized = province.trim();
      
      // Handle specific variations found in database
      if (normalized === 'JAWA TIMUR') return 'Jawa Timur';
      if (normalized === 'DI Yogyakarta') return 'Yogyakarta';
      if (normalized === 'Bandar Lampung') return 'Lampung';
      
      return normalized;
    };

    // Count members by normalized province
    const provinceCount = members.reduce((acc, member) => {
      const provinsi = normalizeProvince(member.provinsi);
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
      .filter(([province]) => {
        const hasCoordinates = PROVINCE_COORDINATES[province as keyof typeof PROVINCE_COORDINATES];
        if (!hasCoordinates && province !== 'Tidak Diketahui') {
          console.warn(`No coordinates found for province: ${province}`);
        }
        return hasCoordinates;
      })
      .map(([province, count]) => ({
        province,
        count,
        coordinates: PROVINCE_COORDINATES[province as keyof typeof PROVINCE_COORDINATES],
        color: count > 50 ? '#10b981' : count > 10 ? '#f59e0b' : '#ef4444',
        size: Math.max(20, Math.min(60, count * 2))
      }))
      .sort((a, b) => b.count - a.count); // Sort by count for better visualization

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
        <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg border overflow-hidden">
          {/* Indonesia map background */}
          <div className="absolute inset-0 p-4">
            <img 
              src={indonesiaMapSvg}
              alt="Indonesia Map"
              className="w-full h-full object-contain opacity-30 filter grayscale"
              style={{ 
                filter: 'grayscale(1) opacity(0.3) drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
              }}
            />
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