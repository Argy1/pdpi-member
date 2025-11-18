import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EbookFormModal } from '@/components/admin/bankdata/EbookFormModal';
import { format } from 'date-fns';

export interface AdminEbook {
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
  isActive: boolean;
  createdAt: Date;
  fileName?: string;
}

// Dummy data
const INITIAL_DUMMY_EBOOKS: AdminEbook[] = [
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
    description: 'Pedoman lengkap mengenai diagnosis dan penatalaksanaan PPOK.',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    fileName: 'pedoman-ppok-2023.pdf',
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
    description: 'Konsensus terbaru mengenai tatalaksana asma di Indonesia.',
    isActive: true,
    createdAt: new Date('2024-02-20'),
    fileName: 'konsensus-asma-2024.pdf',
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
    description: 'Buku ajar lengkap mengenai ilmu penyakit paru dan pernapasan.',
    isActive: true,
    createdAt: new Date('2023-08-10'),
    fileName: 'buku-ajar-respirologi-ed2.pdf',
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
    description: 'Comprehensive guidelines for lung cancer screening.',
    isActive: false,
    createdAt: new Date('2024-05-15'),
    fileName: 'lung-cancer-screening.pdf',
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
    description: 'SOP lengkap untuk pelaksanaan bronkoskopi.',
    isActive: true,
    createdAt: new Date('2023-11-05'),
    fileName: 'sop-bronkoskopi.pdf',
  },
];

const AdminBankData = () => {
  const { toast } = useToast();
  const [ebooks, setEbooks] = useState<AdminEbook[]>(INITIAL_DUMMY_EBOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<AdminEbook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<AdminEbook | null>(null);

  // Filter ebooks
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ebook.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Mobile card view
  const EbookMobileCard = ({ ebook }: { ebook: AdminEbook }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base mb-1">{ebook.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {ebook.category}
              </Badge>
              <Badge
                variant={ebook.isActive ? 'default' : 'outline'}
                className="text-xs"
              >
                {ebook.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {ebook.language}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(ebook)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleActive(ebook.id)}>
                {ebook.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Aktifkan
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(ebook)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tahun:</span>
            <span className="font-medium">{ebook.year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unduhan:</span>
            <span className="font-medium">{ebook.downloadCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dibuat:</span>
            <span className="font-medium">
              {format(ebook.createdAt, 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleAdd = () => {
    setEditingEbook(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (ebook: AdminEbook) => {
    setEditingEbook(ebook);
    setIsFormModalOpen(true);
  };

  const handleSave = (ebookData: Partial<AdminEbook>) => {
    if (editingEbook) {
      // Update existing
      setEbooks((prev) =>
        prev.map((e) =>
          e.id === editingEbook.id ? { ...e, ...ebookData } : e
        )
      );
      toast({
        title: 'E-book diperbarui',
        description: 'Data e-book berhasil diperbarui.',
      });
    } else {
      // Add new
      const newEbook: AdminEbook = {
        id: Date.now().toString(),
        createdAt: new Date(),
        downloadCount: 0,
        isActive: true,
        ...ebookData,
      } as AdminEbook;
      setEbooks((prev) => [newEbook, ...prev]);
      toast({
        title: 'E-book ditambahkan',
        description: 'E-book baru berhasil ditambahkan.',
      });
    }
    setIsFormModalOpen(false);
    setEditingEbook(null);
  };

  const handleToggleActive = (id: string) => {
    setEbooks((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isActive: !e.isActive } : e
      )
    );
    toast({
      title: 'Status diubah',
      description: 'Status e-book berhasil diubah.',
    });
  };

  const handleDeleteClick = (ebook: AdminEbook) => {
    setEbookToDelete(ebook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ebookToDelete) {
      setEbooks((prev) => prev.filter((e) => e.id !== ebookToDelete.id));
      toast({
        title: 'E-book dihapus',
        description: 'E-book berhasil dihapus dari sistem.',
      });
      setDeleteDialogOpen(false);
      setEbookToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold heading-medical">Manajemen Bank Data</h1>
        <p className="text-muted-foreground mt-1">
          Kelola e-book, pedoman, dan dokumen PDPI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total E-book</CardDescription>
            <CardTitle className="text-2xl">{ebooks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>E-book Aktif</CardDescription>
            <CardTitle className="text-2xl">
              {ebooks.filter((e) => e.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Unduhan</CardDescription>
            <CardTitle className="text-2xl">
              {ebooks.reduce((sum, e) => sum + e.downloadCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>E-book Tahun Ini</CardDescription>
            <CardTitle className="text-2xl">
              {ebooks.filter((e) => e.year === new Date().getFullYear()).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
            </div>
            <Button onClick={handleAdd} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah E-book
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Bahasa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Unduhan</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEbooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada e-book yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEbooks.map((ebook) => (
                    <TableRow key={ebook.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ebook.title}</div>
                          {ebook.subtitle && (
                            <div className="text-sm text-muted-foreground">
                              {ebook.subtitle}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ebook.category}</Badge>
                      </TableCell>
                      <TableCell>{ebook.year}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ebook.language}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ebook.isActive ? 'default' : 'outline'}
                          className={ebook.isActive ? 'bg-success' : ''}
                        >
                          {ebook.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ebook.downloadCount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {format(ebook.createdAt, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(ebook)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(ebook.id)}>
                              {ebook.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(ebook)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredEbooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada e-book yang ditemukan
              </div>
            ) : (
              filteredEbooks.map((ebook) => (
                <EbookMobileCard key={ebook.id} ebook={ebook} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <EbookFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEbook(null);
        }}
        onSave={handleSave}
        ebook={editingEbook}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus e-book ini?</AlertDialogTitle>
            <AlertDialogDescription>
              E-book "{ebookToDelete?.title}" akan dihapus permanen dari sistem.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBankData;
