import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Download, Eye, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function RiwayatPembayaran() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  // Redirect admins to admin iuran page
  useEffect(() => {
    if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
      navigate('/admin/iuran', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    // Don't fetch for admins
    if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
      setLoading(false);
      return;
    }
    fetchPayments();
  }, [statusFilter, profile]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('payment_groups')
        .select(`
          *,
          payment_items(count)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter.toUpperCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Lunas
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu
          </Badge>
        );
      case 'EXPIRED':
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

  const handleViewInvoice = (groupCode: string) => {
    navigate(`/invoice/${groupCode}`);
  };

  const filteredPayments = payments.filter(payment => 
    payment.group_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Early return for admins
  if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                    placeholder="Cari berdasarkan kode invoice atau metode..."
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
            <CardDescription>{filteredPayments.length} transaksi ditemukan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada transaksi pembayaran
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Invoice</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">{payment.group_code}</TableCell>
                        <TableCell>
                          {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: id })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatRupiah(payment.total_payable)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(payment.group_code)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'PAID' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewInvoice(payment.group_code)}
                              >
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
