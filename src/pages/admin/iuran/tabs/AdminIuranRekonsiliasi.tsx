import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, RefreshCcw, Download, Search } from 'lucide-react';
import { useMemberPaymentStatus } from '@/hooks/useMemberPaymentStatus';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function AdminIuranRekonsiliasi() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const { members, loading, stats, refetch } = useMemberPaymentStatus(parseInt(selectedYear));

  const years = Array.from({ length: 7 }, (_, i) => 2026 + i);

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.npa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.cabang?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || member.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredMembers.length === 0) {
      toast({
        title: 'Info',
        description: 'Tidak ada data untuk diekspor',
      });
      return;
    }

    const exportData = filteredMembers.map((member, index) => ({
      No: index + 1,
      NPA: member.npa || '-',
      Nama: member.nama,
      Cabang: member.cabang || '-',
      Email: member.email || '-',
      'No. HP': member.no_hp || '-',
      'Status Pembayaran': member.payment_status === 'PAID' ? 'Lunas' : 'Belum Bayar',
      'Tanggal Bayar': member.paid_at 
        ? format(new Date(member.paid_at), 'dd MMM yyyy', { locale: id }) 
        : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Status Iuran ${selectedYear}`);
    XLSX.writeFile(wb, `status-iuran-${selectedYear}-${format(new Date(), 'yyyyMMdd')}.xlsx`);

    toast({
      title: 'Berhasil',
      description: 'Data berhasil diekspor ke Excel',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Anggota</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sudah Bayar</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Belum Bayar</p>
                <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.total > 0 ? Math.round((stats.unpaid / stats.total) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Status Pembayaran Iuran Anggota</CardTitle>
              <CardDescription>
                Daftar status pembayaran iuran untuk tahun {selectedYear}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="default" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NPA, atau cabang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    Tahun {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as 'ALL' | 'PAID' | 'UNPAID')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PAID">Sudah Bayar</SelectItem>
                <SelectItem value="UNPAID">Belum Bayar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">No</TableHead>
                  <TableHead>NPA</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Bayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada data anggota
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{member.npa || '-'}</TableCell>
                      <TableCell className="font-medium">{member.nama}</TableCell>
                      <TableCell>{member.cabang || '-'}</TableCell>
                      <TableCell className="text-sm">{member.email || '-'}</TableCell>
                      <TableCell className="text-sm">{member.no_hp || '-'}</TableCell>
                      <TableCell>
                        {member.payment_status === 'PAID' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Belum Bayar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.paid_at 
                          ? format(new Date(member.paid_at), 'dd MMM yyyy', { locale: id })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data anggota
              </div>
            ) : (
              filteredMembers.map((member, index) => (
                <Card key={member.id} className="border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{member.nama}</p>
                        <p className="text-sm text-muted-foreground">NPA: {member.npa || '-'}</p>
                      </div>
                      {member.payment_status === 'PAID' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lunas
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Belum
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                      <div>
                        <p className="text-muted-foreground text-xs">Cabang</p>
                        <p className="font-medium">{member.cabang || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Tanggal Bayar</p>
                        <p className="font-medium">
                          {member.paid_at 
                            ? format(new Date(member.paid_at), 'dd MMM yyyy', { locale: id })
                            : '-'}
                        </p>
                      </div>
                    </div>
                    {(member.email || member.no_hp) && (
                      <div className="pt-2 border-t text-xs">
                        {member.email && <p className="text-muted-foreground">📧 {member.email}</p>}
                        {member.no_hp && <p className="text-muted-foreground">📱 {member.no_hp}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Menampilkan {filteredMembers.length} dari {members.length} anggota
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
