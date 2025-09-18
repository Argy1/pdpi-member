import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Removed mock data - will use data from MemberContext instead

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isPusatAdmin, profile } = useAuth();
  const { toast } = useToast();

  // Use the new hook for fetching data
  const { 
    members, 
    total, 
    loading, 
    error, 
    refresh 
  } = useMembers({
    query: searchTerm,
    status: selectedStatus || undefined,
    sort: sortConfig.key ? `${sortConfig.key}_${sortConfig.direction}` : 'nama_asc',
    limit: 50,
    page: currentPage
  });

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

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
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, NPA, rumah sakit, atau kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                  <DropdownMenuItem onClick={() => setSelectedStatus('AKTIF')}>
                    Aktif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('PENDING')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('TIDAK_AKTIF')}>
                    Nonaktif
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
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
                  <TableHead>Spesialis</TableHead>
                  <TableHead>Rumah Sakit</TableHead>
                  <TableHead>Lokasi</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Memuat data anggota...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
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
                    <TableCell colSpan={8} className="text-center py-12">
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
                      <TableCell>{member.spesialis}</TableCell>
                      <TableCell>{member.rumahSakit || member.tempat_tugas}</TableCell>
                      <TableCell>{member.kota || member.kota_kabupaten}, {member.provinsi}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}