import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminIuranLaporan() {
  const { isAdminPusat, branchId } = useAdminAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('2026');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalAmount: 0,
    paidCount: 0,
    paidAmount: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [yearFilter, statusFilter, methodFilter, branchId, isAdminPusat]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const yearStart = new Date(parseInt(yearFilter), 0, 1);
      const yearEnd = new Date(parseInt(yearFilter), 11, 31, 23, 59, 59);

      let query = supabase
        .from('payment_groups')
        .select('*')
        .gte('created_at', yearStart.toISOString())
        .lte('created_at', yearEnd.toISOString())
        .order('created_at', { ascending: false });

      if (!isAdminPusat && branchId) {
        query = query.eq('pd_scope', branchId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter.toUpperCase());
      }

      if (methodFilter !== 'all') {
        query = query.eq('method', methodFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReportData(data || []);

      // Calculate summary
      const totalCount = data?.length || 0;
      const totalAmount = data?.reduce((sum, p) => sum + (p.total_payable || 0), 0) || 0;
      const paidCount = data?.filter(p => p.status === 'PAID').length || 0;
      const paidAmount = data?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.total_payable || 0), 0) || 0;

      setSummary({
        totalCount,
        totalAmount,
        paidCount,
        paidAmount,
      });
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data laporan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast({
        title: 'Info',
        description: 'Tidak ada data untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    const csvHeaders = ['Kode Invoice', 'Tanggal', 'Metode', 'Total', 'Status', 'Paid At'];
    const csvData = reportData.map(p => [
      p.group_code,
      format(new Date(p.created_at), 'dd/MM/yyyy HH:mm', { locale: id }),
      p.method === 'qris' ? 'QRIS' : 'Transfer Bank',
      p.total_payable,
      p.status,
      p.paid_at ? format(new Date(p.paid_at), 'dd/MM/yyyy HH:mm', { locale: id }) : '-',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-iuran-${yearFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Berhasil',
      description: 'Laporan berhasil diunduh',
    });
  };

  const years = Array.from({ length: 7 }, (_, i) => 2026 + i);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportCSV} disabled={loading || reportData.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Tagihan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRupiah(summary.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Lunas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{summary.paidCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRupiah(summary.paidAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {summary.totalCount - summary.paidCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRupiah(summary.totalAmount - summary.paidAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {summary.totalCount > 0 
                ? Math.round((summary.paidCount / summary.totalCount) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Laporan</CardTitle>
          <CardDescription>Daftar transaksi berdasarkan filter yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada data untuk ditampilkan</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Invoice</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {payment.group_code}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatRupiah(payment.total_payable)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'PAID'
                              ? 'default'
                              : payment.status === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.paid_at 
                          ? format(new Date(payment.paid_at), 'dd MMM yyyy, HH:mm', { locale: id })
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
