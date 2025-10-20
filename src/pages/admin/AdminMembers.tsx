import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/SearchBar';
import { MemberFiltersComponent } from '@/components/MemberFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMembers } from '@/hooks/useMembers';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  Upload,
  SortAsc,
  SortDesc,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MemberFilters } from '@/types/member';
import { AnggotaAPI } from '@/pages/api/AnggotaAPI';

// Removed mock data - will use data from MemberContext instead

export default function AdminMembers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || '');
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [filters, setFilters] = useState<MemberFilters>({
    query: searchParams.get("q") || '',
    provinsi_kantor: [],
    kota_kabupaten_kantor: [],
    pd: [],
    subspesialis: [],
    status: []
  });
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSubspecialties, setAvailableSubspecialties] = useState<string[]>([]);
  const [hospitalTypes, setHospitalTypes] = useState<string[]>([]);
  const { isPusatAdmin, isCabangMalukuAdmin, isCabangKaltengAdmin, userBranch, profile } = useAuth();
  const { toast } = useToast();

  // Use the new hook for fetching data
  const { 
    members, 
    total, 
    loading, 
    error, 
    refresh 
  } = useMembers({
    query: filters.query,
    provinsi_kantor: filters.provinsi_kantor,
    pd: (isCabangMalukuAdmin || isCabangKaltengAdmin) ? userBranch || undefined : filters.pd?.join(','),
    subspesialis: filters.subspesialis?.join(','),
    namaHurufDepan: filters.namaHurufDepan,
    hospitalType: filters.hospitalType,
    namaRS: filters.namaRS,
    kota_kabupaten_kantor: filters.kota_kabupaten_kantor,
    status: filters.status?.join(',') || selectedStatus || undefined,
    sort: sortConfig.key ? `${sortConfig.key}_${sortConfig.direction}` : 'nama_asc',
    limit: 50,
    page: currentPage,
    scope: 'admin'
  });

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const provinceResult = await AnggotaAPI.getAvailableProvinces();
        const cityResult = await AnggotaAPI.getAvailableCities();
        
        const { data: branchData } = await supabase
          .from('members')
          .select('cabang')
          .not('cabang', 'is', null);

        const branches = [...new Set(branchData?.map(m => m.cabang).filter(Boolean))] as string[];
        
        setAvailableProvinces(provinceResult.data || []);
        setAvailableBranches(branches.sort());
        setAvailableCities(cityResult.data || []);
        setAvailableSubspecialties([]); // Add subspecialty logic if needed

        // Fetch hospital types
        const hospitalTypesResult = await AnggotaAPI.getHospitalTypes();
        if (hospitalTypesResult.data) {
          setHospitalTypes(hospitalTypesResult.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [filters.query, currentPage, setSearchParams]);

  // Reset page when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filters, selectedStatus]);

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      await refresh(); // Refresh the list
      toast({
        title: 'Anggota dihapus',
        description: 'Data anggota berhasil dihapus dari sistem.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus data anggota.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAllMembers = async () => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .gt('created_at', '1900-01-01'); // Delete all records by using a condition that matches all

      if (error) {
        throw error;
      }

      await refresh(); // Refresh the list
      toast({
        title: 'Semua data dihapus',
        description: 'Seluruh data anggota berhasil dihapus dari sistem.',
      });
    } catch (error) {
      console.error('Error deleting all members:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus semua data anggota.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AKTIF':
      case 'Aktif':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case 'PENDING':
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'TIDAK_AKTIF':
      case 'Nonaktif':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Nonaktif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return <SortAsc className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Anggota</h1>
          <p className="text-muted-foreground">
            Kelola data anggota PDPI
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/anggota/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus Semua Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus Semua Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus SEMUA data anggota beserta biodatanya? 
                    Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh database anggota.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllMembers}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ya, Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Gunakan filter untuk menemukan anggota dengan cepat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar
                  value={filters.query || ''}
                  onSearch={(query) => {
                    setFilters(prev => ({ ...prev, query }))
                    setCurrentPage(1)
                  }}
                  placeholder="Cari nama anggota..."
                  size="default"
                  scope="admin"
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Status: {selectedStatus || 'Semua'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus('')}>
                      Semua Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus('Biasa')}>
                      Biasa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus('Luar Biasa')}>
                      Luar Biasa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus('Meninggal')}>
                      Meninggal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus('Muda')}>
                      Muda
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <MemberFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              provinces={availableProvinces}
              pds={availableBranches}
              cities={availableCities}
              hospitalTypes={hospitalTypes}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Anggota ({loading ? 'Memuat...' : total})
            {error && <span className="text-red-600 text-sm"> - Error: {error}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center gap-2">
                      Nama
                      <SortIcon column="nama" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('npa')}
                  >
                    <div className="flex items-center gap-2">
                      NPA
                      <SortIcon column="npa" />
                    </div>
                  </TableHead>
                  <TableHead>Alumni</TableHead>
                  <TableHead>Rumah Sakit</TableHead>
                  <TableHead>Kota/Kabupaten Kantor</TableHead>
                  <TableHead>Provinsi Kantor</TableHead>
                  <TableHead>Kota/Kabupaten Rumah</TableHead>
                  <TableHead>Provinsi Rumah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Tgl Daftar
                      <SortIcon column="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Memuat data anggota...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="text-red-600 mb-4">
                        Gagal memuat data: {error}
                      </div>
                      <Button onClick={refresh} variant="outline">
                        Coba Lagi
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <p className="text-muted-foreground">
                        Tidak ada anggota yang ditemukan.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.nama}</TableCell>
                      <TableCell>{member.npa}</TableCell>
                      <TableCell>{member.alumni || '-'}</TableCell>
                      <TableCell>{member.rumahSakit || member.tempat_tugas}</TableCell>
                      <TableCell>{member.kota_kabupaten_kantor || '-'}</TableCell>
                      <TableCell>{member.provinsi_kantor || '-'}</TableCell>
                      <TableCell>{member.kota_kabupaten_rumah || '-'}</TableCell>
                      <TableCell>{member.provinsi_rumah || '-'}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>{new Date(member.createdAt || member.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/anggota/${member.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/anggota/${member.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus data anggota "{member.nama}"? 
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {total > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, total)} dari {total} anggota
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <span className="text-sm">Tampilkan</span>
                  <select 
                    className="border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={50}
                    onChange={(e) => {
                      // For now we'll keep 50 as default, but this can be made dynamic later
                      console.log('Items per page:', e.target.value);
                    }}
                  >
                    <option value={10}>10 per halaman</option>
                    <option value={25}>25 per halaman</option>
                    <option value={50}>50 per halaman</option>
                    <option value={100}>100 per halaman</option>
                  </select>
                </label>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="focus-visible"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / 50)) }, (_, i) => {
                      const totalPages = Math.ceil(total / 50);
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9 h-9 focus-visible"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(total / 50)}
                    className="focus-visible"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}