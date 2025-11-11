import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users as UsersIcon, DollarSign, Activity, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminIuranDashboard() {
  const navigate = useNavigate();
  const { isAdminPusat, branchId, loading: authLoading } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalCollection: 0,
    paidCount: 0,
    pendingCount: 0,
    thisMonthCollection: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [topBranches, setTopBranches] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, branchId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Build query with role-based filtering
      let paymentsQuery = supabase
        .from('payment_groups')
        .select(`
          *,
          payment_items(count)
        `);

      if (!isAdminPusat && branchId) {
        paymentsQuery = paymentsQuery.eq('pd_scope', branchId);
      }

      const { data: payments } = await paymentsQuery;

      // Calculate KPIs
      const total = payments?.reduce((sum, p) => p.status === 'PAID' ? sum + p.total_payable : sum, 0) || 0;
      const paid = payments?.filter(p => p.status === 'PAID').length || 0;
      const pending = payments?.filter(p => p.status === 'PENDING').length || 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthTotal = payments?.filter(p => 
        p.status === 'PAID' && new Date(p.paid_at) >= thisMonth
      ).reduce((sum, p) => sum + p.total_payable, 0) || 0;

      setKpiData({
        totalCollection: total,
        paidCount: paid,
        pendingCount: pending,
        thisMonthCollection: thisMonthTotal
      });

      // Recent payments
      const recent = payments
        ?.filter(p => p.status === 'PAID')
        .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
        .slice(0, 5) || [];
      
      setRecentPayments(recent);

      // Top branches (admin pusat only)
      if (isAdminPusat) {
        const { data: branchStats } = await supabase
          .from('payment_groups')
          .select(`
            pd_scope,
            total_payable,
            status,
            branches(name)
          `)
          .eq('status', 'PAID');

        const branchTotals = branchStats?.reduce((acc: any, p) => {
          const branchName = (p as any).branches?.name || 'Tidak ada PD';
          if (!acc[branchName]) {
            acc[branchName] = { name: branchName, total: 0, count: 0 };
          }
          acc[branchName].total += p.total_payable;
          acc[branchName].count += 1;
          return acc;
        }, {});

        const top = Object.values(branchTotals || {})
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 5);

        setTopBranches(top as any[]);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Iuran</h1>
          <p className="text-muted-foreground">Ringkasan pembayaran iuran anggota</p>
        </div>
        <Button onClick={() => navigate('/admin/iuran/bayar-mewakili')}>
          <UsersIcon className="mr-2 h-4 w-4" />
          Bayar Mewakili
        </Button>
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
            <p className="text-2xl font-bold text-primary">{formatRupiah(kpiData.totalCollection)}</p>
            <p className="text-xs text-muted-foreground mt-1">Semua periode</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Tagihan Lunas</CardDescription>
              <UsersIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{kpiData.paidCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Invoice dibayar</p>
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
            <p className="text-2xl font-bold text-amber-600">{kpiData.pendingCount}</p>
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
            <p className="text-2xl font-bold text-blue-600">{formatRupiah(kpiData.thisMonthCollection)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), 'MMMM yyyy', { locale: id })}
            </p>
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
            {recentPayments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Belum ada pembayaran</p>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1">
                    <p className="font-semibold">{payment.group_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.paid_at ? format(new Date(payment.paid_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatRupiah(payment.total_payable)}</p>
                    <Badge variant="default" className="mt-1 bg-green-500">Lunas</Badge>
                  </div>
                </div>
              ))
            )}
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

      {/* Top Branches - Admin Pusat only */}
      {isAdminPusat && topBranches.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Top Cabang</CardTitle>
            <CardDescription>Cabang dengan pembayaran tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBranches.map((branch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <p className="font-semibold">{branch.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatRupiah(branch.total)}</p>
                    <p className="text-xs text-muted-foreground">{branch.count} invoice</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
