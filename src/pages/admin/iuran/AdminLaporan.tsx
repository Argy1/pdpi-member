import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';

export default function AdminLaporan() {
  const [periodFilter, setPeriodFilter] = useState('2025');
  const [cabangFilter, setCabangFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Dummy summary data
  const summary = {
    totalCollection: 125000000,
    totalMembers: 850,
    qrisPayments: 600,
    transferPayments: 250,
    avgPaymentTime: '2.5 jam'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Laporan Iuran</h1>
        <p className="text-muted-foreground">Generate dan export laporan pembayaran iuran</p>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih kriteria laporan yang ingin dihasilkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Periode</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">Tahun 2025</SelectItem>
                  <SelectItem value="2024">Tahun 2024</SelectItem>
                  <SelectItem value="2023">Tahun 2023</SelectItem>
                  <SelectItem value="all">Semua Periode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cabang/PD</label>
              <Select value={cabangFilter} onValueChange={setCabangFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                  <SelectItem value="jabar">Jawa Barat</SelectItem>
                  <SelectItem value="jatim">Jawa Timur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metode Pembayaran</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Terkumpul</p>
            <p className="text-2xl font-bold text-primary">Rp {summary.totalCollection.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Anggota Bayar</p>
            <p className="text-2xl font-bold text-green-600">{summary.totalMembers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Via QRIS</p>
            <p className="text-2xl font-bold text-blue-600">{summary.qrisPayments}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Via Transfer</p>
            <p className="text-2xl font-bold text-purple-600">{summary.transferPayments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export Laporan
          </CardTitle>
          <CardDescription>Download laporan dalam berbagai format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 gap-3 justify-start" size="lg">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Laporan Lengkap (Excel)</p>
                <p className="text-xs text-muted-foreground">Detail semua transaksi</p>
              </div>
            </Button>

            <Button variant="outline" className="h-20 gap-3 justify-start" size="lg">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Ringkasan (PDF)</p>
                <p className="text-xs text-muted-foreground">Ringkasan statistik</p>
              </div>
            </Button>

            <Button variant="outline" className="h-20 gap-3 justify-start" size="lg">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Per Cabang (Excel)</p>
                <p className="text-xs text-muted-foreground">Breakdown per cabang/PD</p>
              </div>
            </Button>

            <Button variant="outline" className="h-20 gap-3 justify-start" size="lg">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Anggota Belum Bayar (CSV)</p>
                <p className="text-xs text-muted-foreground">Daftar tunggakan</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Informasi Laporan</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Laporan dihasilkan berdasarkan filter yang dipilih</li>
            <li>• Data realtime, update otomatis setiap pembayaran baru</li>
            <li>• Laporan Excel dapat dibuka di Microsoft Excel atau Google Sheets</li>
            <li>• Semua export tersimpan di log untuk audit trail</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
