import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import useSWR from 'swr'
import { StatsAPI } from '@/pages/api/StatsAPI'
import 'leaflet/dist/leaflet.css'

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
      <div style="display: flex; flex-direction: column; align-items: center;">
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
    iconAnchor: [size / 2, (size / 2) + 12],
  })
}

export default function IndonesiaMapClient({ filters }: IndonesiaMapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  
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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      scrollWheelZoom: true,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !data) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    data.forEach((centroid) => {
      const marker = L.marker([centroid.lat, centroid.lng], {
        icon: createLabelIcon(centroid.total)
      })

      const popupContent = `
        <div class="p-2 min-w-[180px]">
          <h3 class="font-semibold text-base text-slate-900 mb-2 border-b border-slate-200 pb-2">
            ${centroid.provinsi}
          </h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-slate-600">Total:</span>
              <span class="font-semibold text-slate-900">
                ${centroid.total.toLocaleString('id-ID')}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-600">Laki-laki:</span>
              <span class="font-medium text-teal-600">
                ${centroid.laki.toLocaleString('id-ID')}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-600">Perempuan:</span>
              <span class="font-medium text-pink-600">
                ${centroid.perempuan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <a
            href="/anggota?provinsi=${encodeURIComponent(centroid.provinsi)}"
            class="mt-3 flex items-center justify-center gap-2 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-3 py-1.5 transition-colors no-underline"
          >
            Lihat Anggota
          </a>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.addTo(mapInstanceRef.current!)
      markersRef.current.push(marker)
    })
  }, [data])

  if (isLoading) {
    return (
      <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-slate-400 dark:text-slate-500 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Tidak Ada Data Provinsi
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Data anggota belum memiliki informasi provinsi.
            <br />
            Silakan perbarui data anggota melalui halaman admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef}
      className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl"
    />
  )
}
