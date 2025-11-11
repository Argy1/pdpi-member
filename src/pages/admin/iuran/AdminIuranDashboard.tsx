import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminIuranDashboard() {
  // Dummy KPI data
  const kpiData = {
    totalCollection: 125000000,
    paidMembers: 850,
    pendingPayments: 45,
    thisMonthCollection: 15000000,
    topBranch: 'DKI Jakarta'
  };

  const recentPayments = [
    { id: 1, name: 'Dr. Ahmad S.', amount: 500000, status: 'verified', date: '2 jam lalu' },
    { id: 2, name: 'Dr. Budi S. (Kolektif 3)', amount: 1500000, status: 'verified', date: '3 jam lalu' },
    { id: 3, name: 'Dr. Citra D.', amount: 1000000, status: 'pending', date: '5 jam lalu' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Iuran</h1>
        <p className="text-muted-foreground">Ringkasan dan statistik pembayaran iuran anggota PDPI</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Terkumpul</CardDescription>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">Rp {kpiData.totalCollection.toLocaleString('id-ID')}</p>
            <p className="text-xs text-muted-foreground mt-1">Tahun berjalan 2025</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Anggota Lunas</CardDescription>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{kpiData.paidMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">dari 1.805 anggota</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Menunggu Verifikasi</CardDescription>
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{kpiData.pendingPayments}</p>
            <p className="text-xs text-muted-foreground mt-1">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Bulan Ini</CardDescription>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">Rp {kpiData.thisMonthCollection.toLocaleString('id-ID')}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>Transaksi terkini yang masuk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-semibold">{payment.name}</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">Rp {payment.amount.toLocaleString('id-ID')}</p>
                  <Badge variant={payment.status === 'verified' ? 'default' : 'secondary'} className="mt-1">
                    {payment.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Grafik Pembayaran
            </CardTitle>
            <CardDescription>Trend pembayaran 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Grafik akan ditampilkan di sini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Branches */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Top 5 Cabang</CardTitle>
          <CardDescription>Cabang dengan pembayaran tertinggi tahun ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Bali'].map((cabang, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <p className="font-semibold">{cabang}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">Rp {(15000000 - idx * 2000000).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-muted-foreground">{120 - idx * 15} anggota</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
