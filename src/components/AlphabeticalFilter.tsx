import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface AlphabeticalFilterProps {
  selectedLetters: string[]
  onLettersChange: (letters: string[]) => void
  className?: string
}

export function AlphabeticalFilter({ 
  selectedLetters, 
  onLettersChange, 
  className = "" 
}: AlphabeticalFilterProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const handleLetterToggle = (letter: string) => {
    const newLetters = selectedLetters.includes(letter)
      ? selectedLetters.filter(l => l !== letter)
      : [...selectedLetters, letter]
    onLettersChange(newLetters)
  }

  const clearAllLetters = () => {
    onLettersChange([])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter Berdasarkan Huruf Depan Nama</h3>
        {selectedLetters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllLetters}
            className="text-muted-foreground hover:text-foreground focus-visible"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      {/* Alphabet Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-13 gap-1">
        {alphabet.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetters.includes(letter) ? "default" : "outline"}
            size="sm"
            onClick={() => handleLetterToggle(letter)}
            className="h-8 w-8 p-0 text-xs focus-visible"
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* Selected Letters Display */}
      {selectedLetters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Dipilih:</span>
          {selectedLetters.map((letter) => (
            <Badge 
              key={letter} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              onClick={() => handleLetterToggle(letter)}
            >
              {letter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}