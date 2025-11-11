import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Calendar, ShoppingCart, History, CheckCircle, AlertCircle } from 'lucide-react';

export default function IuranSaya() {
  const navigate = useNavigate();
  const [selectedYears, setSelectedYears] = useState('1');

  // Dummy data
  const currentPeriod = {
    year: 2025,
    amount: 500000,
    status: 'unpaid',
    dueDate: '31 Desember 2025'
  };

  const recentHistory = [
    { id: 1, period: '2024', amount: 500000, status: 'paid', date: '15 Jan 2024', method: 'QRIS' },
    { id: 2, period: '2023', amount: 450000, status: 'paid', date: '20 Jan 2023', method: 'Transfer' },
    { id: 3, period: '2022', amount: 450000, status: 'paid', date: '18 Jan 2022', method: 'QRIS' }
  ];

  const handleAddToCart = () => {
    navigate('/iuran/checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Iuran Saya</h1>
          </div>
          <p className="text-muted-foreground">Kelola pembayaran iuran anggota PDPI Anda</p>
        </div>

        {/* Current Period Status */}
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Status Iuran Periode {currentPeriod.year}</CardTitle>
                <CardDescription>Jatuh tempo: {currentPeriod.dueDate}</CardDescription>
              </div>
              <Badge variant={currentPeriod.status === 'paid' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                {currentPeriod.status === 'paid' ? (
                  <><CheckCircle className="h-4 w-4 mr-1" /> Lunas</>
                ) : (
                  <><AlertCircle className="h-4 w-4 mr-1" /> Belum Dibayar</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nominal per tahun</p>
                <p className="text-2xl font-bold text-primary">Rp {currentPeriod.amount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Bayar Iuran Baru
            </CardTitle>
            <CardDescription>Pilih periode pembayaran yang ingin Anda bayarkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Jumlah Tahun</label>
                <Select value={selectedYears} onValueChange={setSelectedYears}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jumlah tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Tahun</SelectItem>
                    <SelectItem value="2">2 Tahun</SelectItem>
                    <SelectItem value="3">3 Tahun</SelectItem>
                    <SelectItem value="4">4 Tahun</SelectItem>
                    <SelectItem value="5">5 Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Total Pembayaran</label>
                <div className="h-10 px-4 flex items-center rounded-md border bg-muted">
                  <span className="font-semibold text-primary">
                    Rp {(currentPeriod.amount * parseInt(selectedYears)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddToCart} size="lg" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Tambah ke Keranjang
              </Button>
              <Button variant="outline" onClick={() => navigate('/iuran/kolektif')} size="lg">
                Pembayaran Kolektif
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Snapshot */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Riwayat Pembayaran Terakhir
                </CardTitle>
                <CardDescription>3 transaksi terakhir</CardDescription>
              </div>
              <Button variant="link" onClick={() => navigate('/iuran/riwayat')}>
                Lihat Semua →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.period}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.method}</TableCell>
                    <TableCell className="text-right">Rp {item.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Lunas
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
