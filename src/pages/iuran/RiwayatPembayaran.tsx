import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function RiwayatPembayaran() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dummy data
  const payments = [
    {
      id: 1,
      invoiceCode: 'INV202501001',
      date: '15 Jan 2025',
      period: '2025',
      type: 'Individu',
      method: 'QRIS',
      amount: 500000,
      status: 'paid'
    },
    {
      id: 2,
      invoiceCode: 'INV202412050',
      date: '20 Des 2024',
      period: '2024',
      type: 'Kolektif (3 anggota)',
      method: 'Transfer',
      amount: 1500000,
      status: 'paid'
    },
    {
      id: 3,
      invoiceCode: 'INV202412040',
      date: '18 Des 2024',
      period: '2024',
      type: 'Individu',
      method: 'QRIS',
      amount: 500000,
      status: 'pending'
    },
    {
      id: 4,
      invoiceCode: 'INV202401020',
      date: '15 Jan 2024',
      period: '2023-2024',
      type: 'Individu',
      method: 'Transfer',
      amount: 1000000,
      status: 'paid'
    },
    {
      id: 5,
      invoiceCode: 'INV202312015',
      date: '10 Des 2023',
      period: '2023',
      type: 'Individu',
      method: 'QRIS',
      amount: 450000,
      status: 'expired'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Lunas
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" />
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

  const handleViewInvoice = (invoiceCode: string) => {
    navigate(`/invoice/${invoiceCode}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Riwayat Pembayaran</h1>
          </div>
          <p className="text-muted-foreground">Lihat semua transaksi pembayaran iuran Anda</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan kode invoice, periode, atau metode..."
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
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="expired">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>{payments.length} transaksi ditemukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Invoice</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis/Periode</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium font-mono text-sm">{payment.invoiceCode}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.type}</p>
                          <p className="text-sm text-muted-foreground">Periode {payment.period}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(payment.invoiceCode)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'paid' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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
    </div>
  );
}
