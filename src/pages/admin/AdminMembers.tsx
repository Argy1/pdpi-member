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
import { useMemberContext } from '@/contexts/MemberContext';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  SortAsc,
  SortDesc,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Removed mock data - will use data from MemberContext instead

export default function AdminMembers() {
  const { members, deleteMember, resetMembers } = useMemberContext();
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const { isPusatAdmin, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    filterAndSortMembers();
  }, [searchTerm, selectedStatus, sortConfig, members]);

  useEffect(() => {
    console.log('Members dari context:', members);
    console.log('Filtered members:', filteredMembers);
  }, [members, filteredMembers]);

  const filterAndSortMembers = () => {
    console.log('Starting filter with members:', members.length, 'items');
    let filtered = [...members];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.npa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.spesialis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.rumahSakit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.provinsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    console.log('After all filters, filtered members:', filtered.length, 'items');
    setFilteredMembers(filtered);
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      deleteMember(memberId);
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
          <Button variant="outline" onClick={resetMembers}>
            Reset Data (Testing)
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
          <CardTitle>Daftar Anggota ({filteredMembers.length})</CardTitle>
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
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.nama}</TableCell>
                    <TableCell>{member.npa}</TableCell>
                    <TableCell>{member.spesialis}</TableCell>
                    <TableCell>{member.rumahSakit}</TableCell>
                    <TableCell>{member.kota}, {member.provinsi}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{new Date(member.createdAt).toLocaleDateString('id-ID')}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada anggota yang ditemukan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}