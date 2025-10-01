import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import useSWR from 'swr'

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

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

function createLabelIcon(provinsi: string, total: number) {
  return L.divIcon({
    className: 'pdpi-map-marker',
    html: `
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full bg-teal-600 shadow-md"></div>
        <div class="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[11px] font-bold text-slate-900 shadow-sm whitespace-nowrap">
          ${provinsi}
        </div>
        <div class="mt-0.5 px-2 py-0.5 rounded-full bg-white/90 text-[11px] font-semibold text-teal-600 shadow-sm">
          ${total.toLocaleString('id-ID')}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export default function IndonesiaMapClient({ filters }: IndonesiaMapClientProps) {
  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return params.toString()
  }, [filters])

  const { data, error } = useSWR<CentroidData[]>(
    `/api/stats/centroids${queryString ? `?${queryString}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )

  const hasMarkers = Array.isArray(data) && data.length > 0 && data.some(d => d.total > 0)
  const center: [number, number] = [-2.5, 118]

  if (process.env.NODE_ENV !== 'production') {
    console.log('IndonesiaMap data:', { data, error, hasMarkers })
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {!hasMarkers && (
        <Marker position={[-6.2, 106.8]} icon={createLabelIcon('DKI Jakarta', 0)}>
          <Popup>
            <div className="p-2 text-sm">
              {error ? 'Gagal memuat data centroids' : 'Belum ada data provinsi yang cocok filter.'}
            </div>
          </Popup>
        </Marker>
      )}

      {hasMarkers && data.map((centroid) => (
        <Marker
          key={centroid.provinsi}
          position={[centroid.lat, centroid.lng]}
          icon={createLabelIcon(centroid.provinsi, centroid.total)}
        >
          <Popup maxWidth={250} className="custom-popup">
            <div className="p-3 min-w-[200px]">
              <h3 className="font-bold text-lg text-slate-900 mb-3 border-b-2 border-teal-500 pb-2">
                {centroid.provinsi}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-medium">Total Anggota:</span>
                  <span className="font-bold text-lg text-teal-600">
                    {centroid.total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-600">👨 Laki-laki:</span>
                  <span className="font-semibold text-blue-600">
                    {centroid.laki.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">👩 Perempuan:</span>
                  <span className="font-semibold text-pink-600">
                    {centroid.perempuan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <a
                href={`/anggota?provinsi=${encodeURIComponent(centroid.provinsi)}`}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2 transition-colors no-underline shadow-sm"
              >
                <span>📋</span> Lihat Daftar Anggota
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
