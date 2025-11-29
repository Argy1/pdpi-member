import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDuesStatus } from '@/hooks/useUserDuesStatus';
import { BankDataHero } from '@/components/bankdata/BankDataHero';
import { BankDataFilters } from '@/components/bankdata/BankDataFilters';
import { EbookCard } from '@/components/bankdata/EbookCard';
import { EbookDetailModal } from '@/components/bankdata/EbookDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { useEbooks, type Ebook } from '@/hooks/useEbooks';
import { SEO } from '@/components/SEO';

const BankDataPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasPaidDues, loading: duesLoading, isAdmin, memberData } = useUserDuesStatus();
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

  // Fetch ebooks on mount (only if has access)
  useEffect(() => {
    if (user && !duesLoading && hasPaidDues) {
      loadEbooks();
    }
  }, [user, duesLoading, hasPaidDues]);

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

  // Loading state
  if (authLoading || duesLoading) {
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

  // Access denied - user has not paid dues
  if (!hasPaidDues && !isAdmin) {
    return (
      <>
        <SEO 
          title="Bank Data PDPI - Akses Terbatas"
          description="Akses Bank Data PDPI memerlukan pembayaran iuran anggota."
          url="https://pdpi-member.lovable.app/bank-data"
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Akses Terbatas</CardTitle>
              <CardDescription>
                Bank Data hanya dapat diakses oleh anggota yang telah membayar iuran.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Status Iuran Anda: Belum Lunas</p>
                    <p>Silakan lunasi iuran keanggotaan Anda untuk mendapatkan akses penuh ke Bank Data PDPI.</p>
                  </div>
                </div>
              </div>

              {memberData && (
                <div className="text-sm text-muted-foreground border rounded-lg p-3">
                  <p><span className="font-medium">Nama:</span> {memberData.nama}</p>
                  {memberData.npa && <p><span className="font-medium">NPA:</span> {memberData.npa}</p>}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/iuran-saya">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Bayar Iuran Sekarang
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Loading ebooks
  if (ebooksLoading) {
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
