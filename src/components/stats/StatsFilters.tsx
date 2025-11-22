import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Loader2, Download, FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  loading?: boolean
  onExport?: (format: 'xlsx' | 'csv') => void
  isExporting?: boolean
}

export function StatsFilters({ filters, onFiltersChange, provinces, pds, cities, loading, onExport, isExporting }: StatsFiltersProps) {
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
    <div className="sticky top-14 md:top-16 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex flex-col gap-2 md:gap-3">
          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="flex gap-2 w-full md:flex-1 md:min-w-[280px]">
              <Input
                placeholder="Cari nama, NPA, tempat tugas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-10 rounded-xl border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-teal-500"
                disabled={loading}
              />
              <Button 
                onClick={handleSearch} 
                size="icon" 
                className="h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* Provinsi */}
            <Select
              value={filters.provinsi || 'all'}
              onValueChange={(value) => onFiltersChange({ ...filters, provinsi: value === 'all' ? undefined : value })}
              disabled={loading}
            >
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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
              disabled={loading}
            >
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="PD/Cabang" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Cabang</SelectItem>
                {pds.map(pd => (
                  <SelectItem key={pd} value={pd}>{pd}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Kota */}
            <Select
              value={filters.kota || 'all'}
              onValueChange={(value) => onFiltersChange({ ...filters, kota: value === 'all' ? undefined : value })}
              disabled={loading}
            >
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Kota/Kabupaten" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
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
              disabled={loading}
            >
              <SelectTrigger className="w-[48%] md:w-[140px] h-10 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            {/* Gender */}
            <Select
              value={filters.gender || 'all'}
              onValueChange={(value) => onFiltersChange({ ...filters, gender: value === 'all' ? undefined : value })}
              disabled={loading}
            >
              <SelectTrigger className="w-[48%] md:w-[140px] h-10 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={handleReset} 
                className="h-10 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Export Button Row - Right Aligned */}
          {onExport && (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    disabled={isExporting || loading}
                    className="rounded-xl px-5 py-2.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  >
                    {isExporting ? (
                      <>
                        <Download className="h-4 w-4 mr-2 animate-bounce" />
                        Mengunduh...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => onExport('xlsx')} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export ke Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('csv')} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export ke CSV (.csv)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
