import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
  size?: "default" | "hero"
  className?: string
}

export function SearchBar({ 
  placeholder = "Cari semua data anggota (nama, NPA, alamat, telepon, dll)...",
  size = "default",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/anggota?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setQuery("")
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
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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