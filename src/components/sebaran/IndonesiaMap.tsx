import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import { DivIcon, LatLngExpression } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import useSWR from 'swr'
import { StatsAPI } from '@/pages/api/StatsAPI'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

interface IndonesiaMapProps {
  filters: {
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }
}

interface CentroidData {
  provinsi: string
  lat: number
  lng: number
  total: number
  laki: number
  perempuan: number
}

const fetcher = async (filters: any) => {
  return StatsAPI.getCentroids(filters)
}

function MapBounds({ data }: { data: CentroidData[] }) {
  const map = useMap()

  useEffect(() => {
    if (data && data.length > 0) {
      const bounds: [number, number][] = data.map(d => [d.lat, d.lng])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 })
    }
  }, [data, map])

  return null
}

export function IndonesiaMap({ filters }: IndonesiaMapProps) {
  const [geoData, setGeoData] = useState<any>(null)
  const { data, isLoading, error } = useSWR(['centroids', filters], () => fetcher(filters), {
    revalidateOnFocus: false,
    dedupingInterval: 10000
  })

  useEffect(() => {
    fetch('/geo/indonesia-provinces.geojson')
      .then(res => res.json())
      .then(setGeoData)
      .catch(console.error)
  }, [])

  if (isLoading || !geoData) {
    return (
      <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Gagal memuat peta</p>
      </div>
    )
  }

  const center: LatLngExpression = [-2.5, 118]
  const zoom = 5

  const createCustomIcon = (centroid: CentroidData) => {
    const size = Math.min(Math.max(6 + 2 * Math.sqrt(centroid.total), 12), 40)
    
    const iconHtml = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        <div
          className="rounded-full bg-teal-500 dark:bg-teal-400 border-2 border-white dark:border-slate-900 shadow-lg hover:bg-teal-600 dark:hover:bg-teal-300 transition-colors cursor-pointer"
          style={{
            width: `${size}px`,
            height: `${size}px`
          }}
        />
        <div className="text-[11px] md:text-[12px] font-semibold mt-1 px-2 py-[2px] rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {centroid.total.toLocaleString('id-ID')}
        </div>
      </div>
    )

    return new DivIcon({
      html: iconHtml,
      className: 'custom-marker-icon',
      iconSize: [size, size + 20],
      iconAnchor: [size / 2, size / 2]
    })
  }

  return (
    <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{
              fillColor: '#e0f2f1',
              fillOpacity: 0.15,
              color: '#0d9488',
              weight: 1.5,
              opacity: 0.5
            }}
          />
        )}

        {data && data.length > 0 && (
          <>
            <MapBounds data={data} />
            {data.map((centroid, idx) => (
              <Marker
                key={idx}
                position={[centroid.lat, centroid.lng]}
                icon={createCustomIcon(centroid)}
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
          </>
        )}
      </MapContainer>
    </div>
  )
}
