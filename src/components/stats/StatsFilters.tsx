import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface StatsFiltersProps {
  filters: {
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }
  onFiltersChange: (filters: any) => void
  provinces: string[]
  pds: string[]
  cities: string[]
}

export function StatsFilters({ filters, onFiltersChange, provinces, pds, cities }: StatsFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.q || '')

  const handleSearch = () => {
    onFiltersChange({ ...filters, q: searchInput })
  }

  const handleReset = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const hasActiveFilters = filters.q || filters.provinsi || filters.pd || filters.kota || filters.status || filters.gender

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b p-4 space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex gap-2 flex-1 min-w-[250px]">
          <Input
            placeholder="Cari nama, NPA, tempat tugas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Provinsi */}
        <Select
          value={filters.provinsi || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, provinsi: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Provinsi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Provinsi</SelectItem>
            {provinces.map(prov => (
              <SelectItem key={prov} value={prov}>{prov}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* PD/Cabang */}
        <Select
          value={filters.pd || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, pd: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="PD/Cabang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua PD</SelectItem>
            {pds.map(pd => (
              <SelectItem key={pd} value={pd}>{pd}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Kota */}
        <Select
          value={filters.kota || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, kota: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kota/Kabupaten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kota</SelectItem>
            {cities.slice(0, 100).map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="AKTIF">Aktif</SelectItem>
            <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        {/* Gender */}
        <Select
          value={filters.gender || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, gender: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Jenis Kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
