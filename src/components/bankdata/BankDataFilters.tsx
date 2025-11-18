import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

interface BankDataFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  yearFilter: string;
  onYearChange: (value: string) => void;
  languageFilter: string;
  onLanguageChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const BankDataFilters = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  yearFilter,
  onYearChange,
  languageFilter,
  onLanguageChange,
  sortBy,
  onSortChange,
}: BankDataFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const FilterSelects = () => (
    <>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          <SelectItem value="Pedoman">Pedoman</SelectItem>
          <SelectItem value="Buku Ajar">Buku Ajar</SelectItem>
          <SelectItem value="Konsensus">Konsensus</SelectItem>
          <SelectItem value="SOP">SOP</SelectItem>
          <SelectItem value="Laporan">Laporan</SelectItem>
        </SelectContent>
      </Select>

      <Select value={yearFilter} onValueChange={onYearChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
          <SelectItem value="2023">2023</SelectItem>
          <SelectItem value="2022">2022</SelectItem>
        </SelectContent>
      </Select>

      <Select value={languageFilter} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Bahasa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bahasa</SelectItem>
          <SelectItem value="ID">Indonesia</SelectItem>
          <SelectItem value="EN">Inggris</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="popular">Terpopuler</SelectItem>
          <SelectItem value="a-z">A–Z</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari judul, penulis, atau topik…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-3">
        <FilterSelects />
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter E-book</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-6">
              <FilterSelects />
              <Button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-4"
              >
                Terapkan Filter
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
