import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BankDataHero } from '@/components/bankdata/BankDataHero';
import { BankDataFilters } from '@/components/bankdata/BankDataFilters';
import { EbookCard } from '@/components/bankdata/EbookCard';
import { EbookDetailModal } from '@/components/bankdata/EbookDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Book } from 'lucide-react';

export interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  year: number;
  authors: string;
  version: string;
  language: 'ID' | 'EN';
  downloadCount: number;
  fileSizeMB: number;
  coverUrl?: string;
  description: string;
}

// Dummy data
const DUMMY_EBOOKS: Ebook[] = [
  {
    id: '1',
    title: 'Pedoman Diagnosis dan Penatalaksanaan PPOK',
    subtitle: 'Penyakit Paru Obstruktif Kronik',
    category: 'Pedoman',
    tags: ['PPOK', 'Diagnosis', 'Terapi'],
    year: 2023,
    authors: 'Tim Penyusun PDPI',
    version: 'Revisi 2023',
    language: 'ID',
    downloadCount: 1245,
    fileSizeMB: 5.2,
    description: 'Pedoman lengkap mengenai diagnosis dan penatalaksanaan Penyakit Paru Obstruktif Kronik (PPOK) yang disusun oleh tim ahli PDPI.',
  },
  {
    id: '2',
    title: 'Konsensus Asma Indonesia',
    subtitle: 'Pedoman Praktis Tatalaksana Asma',
    category: 'Konsensus',
    tags: ['Asma', 'Tatalaksana'],
    year: 2024,
    authors: 'Kelompok Kerja Asma PDPI',
    version: 'Edisi 2024',
    language: 'ID',
    downloadCount: 2340,
    fileSizeMB: 4.8,
    description: 'Konsensus terbaru mengenai tatalaksana asma di Indonesia berdasarkan evidence-based medicine.',
  },
  {
    id: '3',
    title: 'Buku Ajar Respirologi',
    subtitle: 'Comprehensive Respiratory Medicine',
    category: 'Buku Ajar',
    tags: ['Respirologi', 'Textbook'],
    year: 2023,
    authors: 'Prof. Dr. Faisal Yunus, dkk',
    version: 'Edisi 2',
    language: 'ID',
    downloadCount: 3120,
    fileSizeMB: 12.5,
    description: 'Buku ajar lengkap mengenai ilmu penyakit paru dan pernapasan untuk mahasiswa kedokteran dan dokter spesialis.',
  },
  {
    id: '4',
    title: 'Lung Cancer Screening Guidelines',
    subtitle: 'Early Detection and Management',
    category: 'Pedoman',
    tags: ['Kanker Paru', 'Skrining'],
    year: 2024,
    authors: 'PDPI Oncology Working Group',
    version: 'Version 1.0',
    language: 'EN',
    downloadCount: 890,
    fileSizeMB: 3.4,
    description: 'Comprehensive guidelines for lung cancer screening, early detection, and management protocols.',
  },
  {
    id: '5',
    title: 'SOP Bronkoskopi',
    subtitle: 'Standar Operasional Prosedur',
    category: 'SOP',
    tags: ['Bronkoskopi', 'Prosedur'],
    year: 2023,
    authors: 'Divisi Bronkologi PDPI',
    version: 'Revisi 1',
    language: 'ID',
    downloadCount: 1567,
    fileSizeMB: 2.1,
    description: 'Standar operasional prosedur lengkap untuk pelaksanaan bronkoskopi diagnostik dan terapeutik.',
  },
  {
    id: '6',
    title: 'Laporan Tahunan PDPI 2023',
    subtitle: 'Annual Report',
    category: 'Laporan',
    tags: ['Laporan', 'Statistik'],
    year: 2023,
    authors: 'PDPI',
    version: 'Final',
    language: 'ID',
    downloadCount: 678,
    fileSizeMB: 8.9,
    description: 'Laporan tahunan PDPI mencakup kegiatan, program, dan statistik organisasi tahun 2023.',
  },
];

const BankDataPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>(DUMMY_EBOOKS);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        setIsPageLoading(false);
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let result = [...DUMMY_EBOOKS];

    // Search
    if (searchQuery) {
      result = result.filter(
        (ebook) =>
          ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ebook.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ebook.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((ebook) => ebook.category === categoryFilter);
    }

    // Year filter
    if (yearFilter !== 'all') {
      result = result.filter((ebook) => ebook.year === parseInt(yearFilter));
    }

    // Language filter
    if (languageFilter !== 'all') {
      result = result.filter((ebook) => ebook.language === languageFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sortBy === 'a-z') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEbooks(result);
  }, [searchQuery, categoryFilter, yearFilter, languageFilter, sortBy]);

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-pdpi py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-32 w-full rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BankDataHero totalEbooks={DUMMY_EBOOKS.length} />

      <div className="container-pdpi py-8">
        <BankDataFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          yearFilter={yearFilter}
          onYearChange={setYearFilter}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filteredEbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Book className="h-20 w-20 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada e-book yang cocok
            </h3>
            <p className="text-muted-foreground">
              Coba ubah kata kunci atau filter pencarian Anda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredEbooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onDetailClick={() => setSelectedEbook(ebook)}
                onDownloadClick={() => console.log('Download dummy:', ebook.title)}
              />
            ))}
          </div>
        )}
      </div>

      <EbookDetailModal
        ebook={selectedEbook}
        open={!!selectedEbook}
        onClose={() => setSelectedEbook(null)}
        onDownload={(ebook) => console.log('Download dummy from modal:', ebook.title)}
      />
    </div>
  );
};

export default BankDataPage;
