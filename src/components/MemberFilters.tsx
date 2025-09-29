import { useState } from "react"
import { Check, ChevronDown, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { MemberFilters } from "@/types/member"
import { AlphabeticalFilter } from "@/components/AlphabeticalFilter"

interface MemberFiltersProps {
  filters: MemberFilters
  onFiltersChange: (filters: MemberFilters) => void
  provinces: string[]
  pds: string[]
  hospitalTypes: string[]
  cities: string[]
  className?: string
}

export function MemberFiltersComponent({ 
  filters, 
  onFiltersChange, 
  provinces, 
  pds,
  hospitalTypes,
  cities,
  className = ""
}: MemberFiltersProps) {
  const [openProvinsi, setOpenProvinsi] = useState(false)
  const [openPD, setOpenPD] = useState(false)
  const [openKota, setOpenKota] = useState(false)
  const [openHospitalType, setOpenHospitalType] = useState(false)

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

  const hasActiveFilters = !!(filters.provinsi?.length || filters.pd?.length || filters.namaHurufDepan?.length || filters.hospitalType?.length || filters.kota?.length)

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
          open={openProvinsi}
          setOpen={setOpenProvinsi}
          title="Provinsi"
          options={provinces}
          filterKey="provinsi"
          placeholder="Cari provinsi..."
        />
        
         <FilterPopover
          open={openPD}
          setOpen={setOpenPD}
          title="Cabang/Wilayah"
          options={pds}
          filterKey="pd"
          placeholder="Cari cabang..."
        />

        <FilterPopover
          open={openKota}
          setOpen={setOpenKota}
          title="Kota/Kabupaten"
          options={cities}
          filterKey="kota"
          placeholder="Cari kota/kabupaten..."
        />

        <FilterPopover
          open={openHospitalType}
          setOpen={setOpenHospitalType}
          title="Jenis Institusi"
          options={hospitalTypes}
          filterKey="hospitalType"
          placeholder="Cari jenis institusi..."
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

      {/* Alphabetical Filter */}
      <AlphabeticalFilter
        selectedLetters={filters.namaHurufDepan || []}
        onLettersChange={handleAlphabetChange}
      />

      {/* Active Filter Tags */}
      {(filters.provinsi?.length || filters.pd?.length || filters.kota?.length || filters.hospitalType?.length) && (
        <div className="flex flex-wrap gap-2">
          {filters.provinsi?.map((province) => (
            <Badge 
              key={province} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("provinsi", province)}
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
          {filters.kota?.map((city) => (
            <Badge 
              key={city} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleFilterChange("kota", city)}
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
        </div>
      )}
    </div>
  )
}