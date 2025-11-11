import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Clock, AlertCircle, TrendingUp, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format, subDays, isAfter, isBefore, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminIuranRingkasan() {
  const { isAdminPusat, branchId, loading: authLoading } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalTagihan: 0,
    lunas: 0,
    outstanding: 0,
    mendekatiJatuhTempo: 0,
    totalLunasAmount: 0,
    totalOutstandingAmount: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchKPIData();
    }
  }, [authLoading, branchId, isAdminPusat]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      let query = supabase
        .from('payment_groups')
        .select('*')
        .gte('created_at', currentMonth.toISOString());

      // Filter by pd_scope for admin_cabang
      if (!isAdminPusat && branchId) {
        query = query.eq('pd_scope', branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const payments = data || [];
      const now = new Date();
      const sevenDaysLater = addDays(now, 7);

      const lunas = payments.filter(p => p.status === 'PAID').length;
      const outstanding = payments.filter(p => p.status === 'PENDING' || p.status === 'EXPIRED').length;
      
      const mendekatiJatuhTempo = payments.filter(p => {
        if (p.status !== 'PENDING' || !p.expired_at) return false;
        const expiry = new Date(p.expired_at);
        return isAfter(expiry, now) && isBefore(expiry, sevenDaysLater);
      }).length;

      const totalLunasAmount = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.total_payable || 0), 0);
      const totalOutstandingAmount = payments.filter(p => p.status === 'PENDING' || p.status === 'EXPIRED').reduce((sum, p) => sum + (p.total_payable || 0), 0);

      setKpiData({
        totalTagihan: payments.length,
        lunas,
        outstanding,
        mendekatiJatuhTempo,
        totalLunasAmount,
        totalOutstandingAmount,
      });

      // Recent payments  
      const recent = payments
        .filter(p => p.status === 'PAID')
        .sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
        .slice(0, 5);
      
      setRecentPayments(recent);
    } catch (error: any) {
      console.error('Error fetching KPI data:', error);
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Total Tagihan Bulan Ini</CardDescription>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{kpiData.totalTagihan}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), 'MMMM yyyy', { locale: id })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Lunas</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{kpiData.lunas}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRupiah(kpiData.totalLunasAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Outstanding</CardDescription>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{kpiData.outstanding}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRupiah(kpiData.totalOutstandingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Mendekati Jatuh Tempo</CardDescription>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{kpiData.mendekatiJatuhTempo}</p>
            <p className="text-xs text-muted-foreground mt-1">≤ 7 hari</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pembayaran Terbaru
          </CardTitle>
          <CardDescription>Transaksi yang baru saja masuk</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada pembayaran bulan ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold font-mono text-sm">{payment.group_code}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payment.paid_at ? format(new Date(payment.paid_at), 'dd MMMM yyyy, HH:mm', { locale: id }) : '-'}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {payment.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{formatRupiah(payment.total_payable)}</p>
                    <Badge className="mt-1 bg-green-500">Lunas</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
