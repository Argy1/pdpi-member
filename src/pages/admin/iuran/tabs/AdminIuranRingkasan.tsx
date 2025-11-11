import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, CheckCircle, Clock, AlertCircle, Loader2, Eye, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function AdminIuranRingkasan() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [paidMembers, setPaidMembers] = useState<any[]>([]);
  const [paidMembersLoading, setPaidMembersLoading] = useState(false);
  
  // Filters
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [pdFilter, setPdFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchKPIData();
      fetchBranches();
      fetchPaidMembers();
    }
  }, [authLoading, branchId, isAdminPusat]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('payment-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_groups',
        },
        (payload) => {
          console.log('Realtime payment update:', payload);
          
          // Show toast notification for new paid invoices
          if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'PAID' && (payload.old as any).status !== 'PAID') {
            toast({
              title: 'Pembayaran Baru Masuk! 🎉',
              description: `Invoice ${(payload.new as any).group_code} telah dibayar - ${formatRupiah((payload.new as any).total_payable)}`,
            });
          }

          // Refresh data
          fetchKPIData();
          fetchPaidMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, isAdminPusat]);

  // Refetch paid members when filters change
  useEffect(() => {
    fetchPaidMembers();
  }, [yearFilter, pdFilter, methodFilter, branchId, isAdminPusat]);

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

      // Recent payments (last 10)
      let recentQuery = supabase
        .from('payment_groups')
        .select('*')
        .eq('status', 'PAID')
        .order('paid_at', { ascending: false })
        .limit(10);

      if (!isAdminPusat && branchId) {
        recentQuery = recentQuery.eq('pd_scope', branchId);
      }

      const { data: recentData } = await recentQuery;
      setRecentPayments(recentData || []);
    } catch (error: any) {
      console.error('Error fetching KPI data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      setBranches(data || []);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchPaidMembers = async () => {
    try {
      setPaidMembersLoading(true);
      
      let query = supabase
        .from('member_dues')
        .select(`
          *,
          members(npa, nama, cabang)
        `)
        .eq('status', 'PAID')
        .eq('year', parseInt(yearFilter))
        .order('paid_at', { ascending: false })
        .limit(100);

      // Filter by PD for admin_cabang or when pdFilter is set
      if (!isAdminPusat && branchId) {
        // Admin cabang: filter by their branch
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branchId)
          .single();
        
        if (branchData?.name) {
          // Can't directly filter on joined table in Supabase query
          // Will filter in-memory after fetching
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data || [];

      // Filter by PD if needed
      if (!isAdminPusat && branchId) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branchId)
          .single();
        
        if (branchData?.name) {
          filteredData = filteredData.filter(d => 
            (d.members as any)?.cabang === branchData.name
          );
        }
      } else if (pdFilter !== 'all') {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', pdFilter)
          .single();
        
        if (branchData?.name) {
          filteredData = filteredData.filter(d => 
            (d.members as any)?.cabang === branchData.name
          );
        }
      }

      // Filter by method if selected
      if (methodFilter !== 'all') {
        const memberDuesIds = filteredData.map(d => d.member_id);
        const years = filteredData.map(d => d.year);
        
        const { data: paymentItemsData } = await supabase
          .from('payment_items')
          .select(`
            member_id,
            year,
            payment_group_id,
            payment_groups(method)
          `)
          .in('member_id', memberDuesIds)
          .in('year', years);

        const validMemberDues = new Set<string>();
        paymentItemsData?.forEach(item => {
          const group = (item as any).payment_groups;
          if (group?.method === methodFilter) {
            validMemberDues.add(`${item.member_id}-${item.year}`);
          }
        });

        filteredData = filteredData.filter(d => 
          validMemberDues.has(`${d.member_id}-${d.year}`)
        );
      }

      setPaidMembers(filteredData);
    } catch (error: any) {
      console.error('Error fetching paid members:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data anggota yang sudah membayar',
        variant: 'destructive',
      });
    } finally {
      setPaidMembersLoading(false);
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

      {/* Recent Payments - Pembayaran Masuk Terbaru */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <CardTitle>Pembayaran Masuk Terbaru</CardTitle>
                <CardDescription>10 transaksi terakhir yang berhasil dibayar (realtime)</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada pembayaran</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {payment.paid_at 
                          ? format(new Date(payment.paid_at), 'dd MMM yyyy, HH:mm', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        {payment.group_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatRupiah(payment.total_payable)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoice/${payment.group_code}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter & Daftar Sudah Membayar */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Sudah Membayar</CardTitle>
          <CardDescription>Anggota yang telah membayar iuran tahun ini</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Tahun</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdminPusat && (
              <div>
                <label className="text-sm font-medium mb-2 block">PD</label>
                <Select value={pdFilter} onValueChange={setPdFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua PD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua PD</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Metode Pembayaran</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {paidMembersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paidMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada anggota yang membayar dengan filter ini</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NPA</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>PD</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidMembers.map((item) => (
                    <TableRow key={`${item.member_id}-${item.year}`}>
                      <TableCell className="font-mono text-sm">
                        {(item.members as any)?.npa || item.npa}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(item.members as any)?.nama || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.year}</Badge>
                      </TableCell>
                      <TableCell>{(item.members as any)?.cabang || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.paid_at 
                          ? format(new Date(item.paid_at), 'dd MMM yyyy', { locale: id })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
