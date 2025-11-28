import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BankDataHero } from '@/components/bankdata/BankDataHero';
import { BankDataFilters } from '@/components/bankdata/BankDataFilters';
import { EbookCard } from '@/components/bankdata/EbookCard';
import { EbookDetailModal } from '@/components/bankdata/EbookDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Book } from 'lucide-react';
import { useEbooks, type Ebook } from '@/hooks/useEbooks';
import { SEO } from '@/components/SEO';

const BankDataPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { fetchActiveEbooks, incrementDownload, getFileUrl, loading: ebooksLoading } = useEbooks();
  
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch ebooks on mount
  useEffect(() => {
    if (user) {
      loadEbooks();
    }
  }, [user]);

  const loadEbooks = async () => {
    const data = await fetchActiveEbooks();
    setEbooks(data);
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...ebooks];

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
  }, [ebooks, searchQuery, categoryFilter, yearFilter, languageFilter, sortBy]);

  const handleDownload = async (ebook: Ebook) => {
    // Increment download count
    await incrementDownload(ebook.id);
    
    // Get file URL and open in new tab
    const fileUrl = getFileUrl(ebook.filePath);
    window.open(fileUrl, '_blank');
  };

  if (authLoading || ebooksLoading) {
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
    <>
      <SEO 
        title="Bank Data PDPI - Koleksi E-Book dan Publikasi Dokter Paru"
        description="Akses koleksi e-book, panduan klinis, dan publikasi ilmiah PDPI. Sumber referensi terpercaya untuk dokter spesialis paru dan respirologi Indonesia."
        keywords="bank data PDPI, e-book kedokteran paru, publikasi pulmonologi, panduan klinis paru, referensi dokter paru, PDPI ebook"
        url="https://pdpi-member.lovable.app/bank-data"
      />
      <div className="min-h-screen bg-background">
        <BankDataHero totalEbooks={ebooks.length} />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
            {filteredEbooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onDetailClick={() => setSelectedEbook(ebook)}
                onDownloadClick={() => handleDownload(ebook)}
              />
            ))}
          </div>
        )}
      </div>

        <EbookDetailModal
          ebook={selectedEbook}
          open={!!selectedEbook}
          onClose={() => setSelectedEbook(null)}
          onDownload={handleDownload}
        />
      </div>
    </>
  );
};

export default BankDataPage;
