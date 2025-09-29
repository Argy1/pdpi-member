import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown, X } from "lucide-react"

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
  const [open, setOpen] = useState(false)
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
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="justify-between focus-visible bg-background border-input hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center space-x-2">
                <span>Filter Huruf Nama</span>
                {selectedLetters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedLetters.length}
                  </Badge>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-popover border-border shadow-lg" align="start">
            <Command className="bg-popover">
              <CommandInput placeholder="Cari huruf..." className="border-0" />
              <CommandList className="max-h-60">
                <CommandEmpty>Tidak ada huruf ditemukan.</CommandEmpty>
                <CommandGroup className="p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {alphabet.map((letter) => (
                      <CommandItem
                        key={letter}
                        onSelect={() => handleLetterToggle(letter)}
                        className="cursor-pointer justify-center p-2 h-8"
                      >
                        <div className="flex items-center justify-center w-full">
                          <Check
                            className={`h-3 w-3 mr-1 ${
                              selectedLetters.includes(letter) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {letter}
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedLetters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllLetters}
            className="text-muted-foreground hover:text-foreground focus-visible"
          >
            <X className="h-4 w-4 mr-1" />
            Reset Huruf
          </Button>
        )}
      </div>

      {/* Selected Letters Display */}
      {selectedLetters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Huruf dipilih:</span>
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