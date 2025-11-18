import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EbookFormModal } from '@/components/admin/bankdata/EbookFormModal';
import { format } from 'date-fns';
import { useEbooks, type AdminEbook } from '@/hooks/useEbooks';

const AdminBankData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    fetchAllEbooks,
    createEbook,
    updateEbook,
    toggleActive,
    deleteEbook,
    loading,
  } = useEbooks();
  
  const [ebooks, setEbooks] = useState<AdminEbook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<AdminEbook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<AdminEbook | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Load ebooks on mount
  useEffect(() => {
    loadEbooks();
  }, []);

  const loadEbooks = async () => {
    const data = await fetchAllEbooks();
    setEbooks(data);
  };

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
              <DropdownMenuItem onClick={() => handleToggleActive(ebook)}>
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
    setPdfFile(null);
    setCoverFile(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (ebook: AdminEbook) => {
    setEditingEbook(ebook);
    setPdfFile(null);
    setCoverFile(null);
    setIsFormModalOpen(true);
  };

  const handleSave = async (ebookData: Partial<AdminEbook>) => {
    const success = editingEbook
      ? await updateEbook(editingEbook.id, ebookData, pdfFile, coverFile)
      : await createEbook(ebookData, pdfFile, coverFile);

    if (success) {
      setIsFormModalOpen(false);
      setEditingEbook(null);
      setPdfFile(null);
      setCoverFile(null);
      await loadEbooks();
    }
  };

  const handleToggleActive = async (ebook: AdminEbook) => {
    const success = await toggleActive(ebook.id, ebook.isActive);
    if (success) {
      await loadEbooks();
    }
  };

  const handleDeleteClick = (ebook: AdminEbook) => {
    setEbookToDelete(ebook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ebookToDelete) {
      const success = await deleteEbook(ebookToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setEbookToDelete(null);
        await loadEbooks();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')} 
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
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
            <Button onClick={handleAdd} className="w-full md:w-auto" disabled={loading}>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredEbooks.length === 0 ? (
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
                            <DropdownMenuItem onClick={() => handleToggleActive(ebook)}>
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat data...
              </div>
            ) : filteredEbooks.length === 0 ? (
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
          setPdfFile(null);
          setCoverFile(null);
        }}
        onSave={handleSave}
        ebook={editingEbook}
        onPdfFileChange={setPdfFile}
        onCoverFileChange={setCoverFile}
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
