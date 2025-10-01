import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import useSWR from 'swr'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { StatsAPI } from '@/pages/api/StatsAPI'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface CentroidData {
  provinsi: string
  lat: number
  lng: number
  total: number
  laki: number
  perempuan: number
}

interface IndonesiaMapClientProps {
  filters: {
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }
}

const fetcher = async (_key: string, filters: any) => {
  return await StatsAPI.getCentroids(filters)
}

function createLabelIcon(total: number) {
  const size = Math.min(Math.max(8 + Math.sqrt(total) * 1.5, 12), 32)
  
  return L.divIcon({
    className: 'pdpi-map-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          margin-top: 4px;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        ">${total.toLocaleString('id-ID')}</div>
      </div>
    `,
    iconSize: [size, size + 24],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function IndonesiaMapClient({ filters }: IndonesiaMapClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const swrKey = useMemo(() => 
    JSON.stringify(['centroids', filters]), 
  [filters])

  const { data, isLoading } = useSWR<CentroidData[]>(
    [swrKey, filters],
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )

  const center = useMemo<[number, number]>(() => [-2.5, 118], [])

  if (!isMounted || isLoading || !data) {
    return (
      <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
    )
  }

  return (
    <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((centroid) => (
          <Marker
            key={centroid.provinsi}
            position={[centroid.lat, centroid.lng]}
            icon={createLabelIcon(centroid.total)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[180px]">
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  {centroid.provinsi}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {centroid.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Laki-laki:</span>
                    <span className="font-medium text-teal-600 dark:text-teal-400">
                      {centroid.laki.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Perempuan:</span>
                    <span className="font-medium text-pink-600 dark:text-pink-400">
                      {centroid.perempuan.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/anggota?provinsi=${encodeURIComponent(centroid.provinsi)}`}
                  className="mt-3 flex items-center justify-center gap-2 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  Lihat Anggota <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
