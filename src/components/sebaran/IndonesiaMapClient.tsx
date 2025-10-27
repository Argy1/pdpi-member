import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import useSWR from 'swr'
import { StatsAPI } from '@/pages/api/StatsAPI'

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

function getCircleColor(total: number): string {
  if (total >= 1 && total <= 10) return 'bg-red-500'
  if (total >= 11 && total <= 50) return 'bg-yellow-400'
  if (total > 50) return 'bg-green-500'
  return 'bg-gray-400'
}

function createLabelIcon(provinsi: string, total: number) {
  const circleColor = getCircleColor(total)
  
  return L.divIcon({
    className: 'pdpi-map-marker',
    html: `
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full ${circleColor} shadow-md"></div>
        <div class="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[11px] font-bold text-slate-900 shadow-sm whitespace-nowrap">
          ${provinsi}
        </div>
        <div class="mt-0.5 px-2 py-0.5 rounded-full bg-white/90 text-[11px] font-semibold text-slate-700 shadow-sm">
          ${total.toLocaleString('id-ID')}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export default function IndonesiaMapClient({ filters }: IndonesiaMapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  
  const swrKey = useMemo(() => 
    JSON.stringify(['centroids', filters]), 
  [filters])

  const { data, error } = useSWR<CentroidData[]>(
    [swrKey, filters],
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )

  // Initialize map once
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
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const hasMarkers = Array.isArray(data) && data.length > 0 && data.some(d => d.total > 0)

    if (process.env.NODE_ENV !== 'production') {
      console.log('IndonesiaMap data:', { data, error, hasMarkers })
    }

    // Show dummy marker if no data
    if (!hasMarkers) {
      const dummyMarker = L.marker([-6.2, 106.8], {
        icon: createLabelIcon('DKI Jakarta', 0)
      })
      
      dummyMarker.bindPopup(`
        <div class="p-2 text-sm">
          ${error ? 'Gagal memuat data centroids' : 'Belum ada data provinsi yang cocok filter.'}
        </div>
      `)
      
      dummyMarker.addTo(mapInstanceRef.current)
      markersRef.current.push(dummyMarker)
      return
    }

    // Add markers for ALL provinces (including those with 0 members)
    data.forEach((centroid) => {
      const marker = L.marker([centroid.lat, centroid.lng], {
        icon: createLabelIcon(centroid.provinsi, centroid.total)
      })

      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg text-slate-900 mb-3 border-b-2 border-teal-500 pb-2">
            ${centroid.provinsi}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-600 font-medium">Total Anggota:</span>
              <span class="font-bold text-lg text-teal-600">
                ${centroid.total.toLocaleString('id-ID')}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-t border-slate-100">
              <span class="text-slate-600">👨 Laki-laki:</span>
              <span class="font-semibold text-blue-600">
                ${centroid.laki.toLocaleString('id-ID')}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-600">👩 Perempuan:</span>
              <span class="font-semibold text-pink-600">
                ${centroid.perempuan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <a
            href="/anggota?provinsi=${encodeURIComponent(centroid.provinsi)}"
            class="mt-4 flex items-center justify-center gap-2 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2 transition-colors no-underline shadow-sm"
          >
            <span>📋</span> Lihat Daftar Anggota
          </a>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      })
      
      marker.addTo(mapInstanceRef.current!)
      markersRef.current.push(marker)
    })
  }, [data, error])

  return (
    <div 
      ref={mapRef}
      className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl"
    />
  )
}
