import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
  size?: "default" | "hero"
  className?: string
  scope?: "public" | "admin"
  onSearch?: (query: string) => void
  value?: string
  defaultValue?: string
}

export function SearchBar({ 
  placeholder,
  size = "default",
  className = "",
  scope = "public",
  onSearch,
  value: controlledValue,
  defaultValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(controlledValue || defaultValue || "")
  const navigate = useNavigate()

  // Default placeholders based on scope
  const defaultPlaceholder = scope === "admin" 
    ? "Cari di semua biodata (nama, NPA, RS, kota, provinsi, PD, jabatan, kontak, STR/SIP)..."
    : "Cari nama/NPA/RS/kota/provinsi/PD..."

  const finalPlaceholder = placeholder || defaultPlaceholder

  // Debounced search function with 1.5 second delay
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery.trim())
      } else if (searchQuery.trim()) {
        navigate(`/anggota?q=${encodeURIComponent(searchQuery.trim())}`)
      } else if (onSearch) {
        onSearch("")
      }
    }, 1500), // 1.5 second debounce to prevent lag
    [onSearch, navigate]
  )

  // Update controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue)
    }
  }, [controlledValue])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query.trim())
    } else if (query.trim()) {
      navigate(`/anggota?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleClear = () => {
    setQuery("")
    if (onSearch) {
      onSearch("")
    }
  }

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const inputClasses = size === "hero" 
    ? "input-hero text-lg pl-12 pr-24" 
    : "h-10 pl-10 pr-20"

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 text-muted-foreground ${
          size === "hero" ? "top-3.5 h-5 w-5" : "top-2.5 h-4 w-4"
        }`} />
        <Input
          type="text"
          placeholder={finalPlaceholder}
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className={`${inputClasses} focus-visible`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className={`${size === "hero" ? "h-8 w-8" : "h-6 w-6"} hover:bg-muted`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            size={size === "hero" ? "default" : "sm"}
            className="focus-visible"
            disabled={!query.trim()}
          >
            <Search className="h-4 w-4 mr-1" />
            Cari
          </Button>
        </div>
      </div>
    </div>
  )
}