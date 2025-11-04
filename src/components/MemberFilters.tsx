import { useState } from "react"
import { Check, ChevronDown, Filter, X, Hospital, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MemberFilters } from "@/types/member"
import { AlphabeticalFilter } from "@/components/AlphabeticalFilter"

interface MemberFiltersProps {
  filters: MemberFilters
  onFiltersChange: (filters: MemberFilters) => void
  provinces: string[]
  pds: string[]
  hospitalTypes: string[]
  cities: string[]
  subspecialties?: string[]
  alumniOptions?: string[]
  className?: string
  isPublicView?: boolean
}

export function MemberFiltersComponent({ 
  filters, 
  onFiltersChange, 
  provinces, 
  pds,
  hospitalTypes,
  cities,
  subspecialties = [
    'Spesialis Paru Konsultan Asma PPOK',
    'Spesialis Paru Konsultan Infeksi',
    'Spesialis Paru Konsultan Onkologi Toraks',
    'Spesialis Paru Konsultan Paru Kerja',
    'Spesialis Paru Konsultan Intervensi & Gawat Napas',
    'Spesialis Paru Konsultan Imunologi'
  ],
  alumniOptions = [
    'BP4',
    'UA',
    'UB',
    'UDAYANA',
    'UI',
    'ULM',
    'UNAIR',
    'UNAND',
    'UNBRA',
    'UNHAS',
    'UNILA',
    'UNLAM',
    'UNRI',
    'UNS',
    'UNSYIAH',
    'UNUD',
    'USK',
    'USU'
  ],
  className = "",
  isPublicView = false
}: MemberFiltersProps) {
  const [openProvinsiKantor, setOpenProvinsiKantor] = useState(false)
  const [openPD, setOpenPD] = useState(false)
  const [openKotaKantor, setOpenKotaKantor] = useState(false)
  const [openHospitalType, setOpenHospitalType] = useState(false)
  const [openSubspecialty, setOpenSubspecialty] = useState(false)
  const [openGelarFISR, setOpenGelarFISR] = useState(false)
  const [openAlumni, setOpenAlumni] = useState(false)

  const handleFilterChange = (type: keyof MemberFilters, value: string) => {
    const currentValues = filters[type] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [type]: newValues.length > 0 ? newValues : undefined
    })
  }

  const handleAlphabetChange = (letters: string[]) => {
    onFiltersChange({
      ...filters,
      namaHurufDepan: letters.length > 0 ? letters : undefined
    })
  }

  const clearFilter = (type: keyof MemberFilters) => {
    onFiltersChange({
      ...filters,
      [type]: undefined
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const handleNamaRSChange = (value: string) => {
    onFiltersChange({
      ...filters,
      namaRS: value || undefined
    })
  }

  const handleNPAChange = (value: string) => {
    onFiltersChange({
      ...filters,
      npa: value || undefined
    })
  }

  const hasActiveFilters = !!(filters.provinsi_kantor?.length || filters.pd?.length || filters.namaHurufDepan?.length || filters.hospitalType?.length || filters.kota_kabupaten_kantor?.length || filters.namaRS || filters.npa || filters.subspesialis?.length || filters.gelar_fisr?.length || filters.alumni?.length)

  const FilterPopover = ({ 
    open, 
    setOpen, 
    title, 
    options, 
    filterKey, 
    placeholder 
  }: {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    options: string[]
    filterKey: keyof MemberFilters
    placeholder: string
  }) => {
    const selectedValues = filters[filterKey] as string[] || []
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between focus-visible"
          >
            <div className="flex items-center space-x-2">
              <span>{title}</span>
              {selectedValues.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedValues.length}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>Tidak ada opsi ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => handleFilterChange(filterKey, option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <FilterPopover
          open={openProvinsiKantor}
          setOpen={setOpenProvinsiKantor}
          title={isPublicView ? "Provinsi" : "Provinsi Kantor"}
          options={provinces}
          filterKey="provinsi_kantor"
          placeholder={isPublicView ? "Cari provinsi..." : "Cari provinsi kantor..."}
        />
        
         <FilterPopover
          open={openPD}
          setOpen={setOpenPD}
          title="Cabang"
          options={pds}
          filterKey="pd"
          placeholder="Cari cabang..."
        />

        <FilterPopover
          open={openKotaKantor}
          setOpen={setOpenKotaKantor}
          title={isPublicView ? "Kota/Kabupaten" : "Kota/Kabupaten Kantor"}
          options={cities}
          filterKey="kota_kabupaten_kantor"
          placeholder={isPublicView ? "Cari kota/kabupaten..." : "Cari kota/kabupaten kantor..."}
        />

        <FilterPopover
          open={openHospitalType}
          setOpen={setOpenHospitalType}
          title="Tipe RS"
          options={hospitalTypes}
          filterKey="hospitalType"
          placeholder="Cari tipe RS..."
        />

        <FilterPopover
          open={openSubspecialty}
          setOpen={setOpenSubspecialty}
          title="Subspesialis"
          options={subspecialties}
          filterKey="subspesialis"
          placeholder="Cari subspesialis..."
        />

        <FilterPopover
          open={openAlumni}
          setOpen={setOpenAlumni}
          title="Alumni Sp-1 FK"
          options={alumniOptions}
          filterKey="alumni"
          placeholder="Cari universitas..."
        />

        <FilterPopover
          open={openGelarFISR}
          setOpen={setOpenGelarFISR}
          title="Gelar FISR"
          options={['Ya', 'Tidak']}
          filterKey="gelar_fisr"
          placeholder="Pilih Gelar FISR..."
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground focus-visible"
          >
            <X className="h-4 w-4 mr-1" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Hospital Name Search Input */}
      <div className="relative max-w-md">
        <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari nama rumah sakit..."
          value={filters.namaRS || ''}
          onChange={(e) => handleNamaRSChange(e.target.value)}
          className="pl-9 focus-visible"
        />
        {filters.namaRS && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNamaRSChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* NPA Search Input */}
      <div className="relative max-w-md">
        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari NPA..."
          value={filters.npa || ''}
          onChange={(e) => handleNPAChange(e.target.value)}
          className="pl-9 focus-visible"
        />
        {filters.npa && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNPAChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Alphabetical Filter */}
      <AlphabeticalFilter
        selectedLetters={filters.namaHurufDepan || []}
        onLettersChange={handleAlphabetChange}
      />

      {/* Active Filter Tags */}
      {(filters.provinsi_kantor?.length || filters.pd?.length || filters.kota_kabupaten_kantor?.length || filters.hospitalType?.length || filters.namaRS || filters.npa || filters.subspesialis?.length || filters.gelar_fisr?.length || filters.alumni?.length) && (
        <div className="flex flex-wrap gap-2">
          {filters.provinsi_kantor?.map((province) => (
            <Badge 
              key={province} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("provinsi_kantor", province)}
            >
              {province}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.pd?.map((pd) => (
            <Badge 
              key={pd} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("pd", pd)}
            >
              {pd}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.kota_kabupaten_kantor?.map((city) => (
            <Badge 
              key={city} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("kota_kabupaten_kantor", city)}
            >
              {city}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.hospitalType?.map((type) => (
            <Badge 
              key={type} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("hospitalType", type)}
            >
              {type}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.namaRS && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleNamaRSChange('')}
            >
              RS: {filters.namaRS}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.npa && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleNPAChange('')}
            >
              NPA: {filters.npa}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.subspesialis?.map((subspecialty) => (
            <Badge 
              key={subspecialty} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("subspesialis", subspecialty)}
            >
              {subspecialty}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.alumni?.map((alumni) => (
            <Badge 
              key={alumni} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("alumni", alumni)}
            >
              Alumni: {alumni}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.gelar_fisr?.map((fisr) => (
            <Badge 
              key={fisr} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("gelar_fisr", fisr)}
            >
              Gelar FISR: {fisr}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}