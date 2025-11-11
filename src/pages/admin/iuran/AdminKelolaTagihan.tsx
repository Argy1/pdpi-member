import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Eye, CheckCircle, Send, XCircle } from 'lucide-react';

export default function AdminKelolaTagihan() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dummy invoices data
  const invoices = [
    {
      id: 1,
      code: 'INV202501001',
      creator: 'Dr. Ahmad Suryadi',
      scope: 'Individu',
      cabang: 'DKI Jakarta',
      method: 'QRIS',
      total: 500000,
      status: 'verified',
      date: '15 Jan 2025'
    },
    {
      id: 2,
      code: 'INV202501002',
      creator: 'Dr. Budi Santoso',
      scope: 'Kolektif (3 anggota)',
      cabang: 'DKI Jakarta',
      method: 'Transfer',
      total: 1500000,
      status: 'pending',
      date: '16 Jan 2025'
    },
    {
      id: 3,
      code: 'INV202501003',
      creator: 'Dr. Citra Dewi',
      scope: 'Individu',
      cabang: 'Jawa Barat',
      method: 'QRIS',
      total: 1000000,
      status: 'expired',
      date: '14 Jan 2025'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terverifikasi
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="bg-amber-500">
            Menunggu
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Kadaluarsa
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Tagihan</h1>
        <p className="text-muted-foreground">Monitor dan verifikasi invoice pembayaran iuran</p>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode invoice, nama pembuat, atau cabang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="expired">Kadaluarsa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-amber-600">12</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terverifikasi Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
          <CardDescription>{invoices.length} invoice ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Invoice</TableHead>
                  <TableHead>Pembuat</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium font-mono text-sm">{invoice.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.creator}</p>
                        <p className="text-xs text-muted-foreground">{invoice.date}</p>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.scope}</TableCell>
                    <TableCell>{invoice.cabang}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.method}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      Rp {invoice.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {invoice.status === 'verified' && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
