import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, FileText, Bell, CheckCircle, Clock, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminIuranKelolaTagihan() {
  const { isAdminPusat, branchId } = useAdminAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentItems, setPaymentItems] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, branchId, isAdminPusat]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payment_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdminPusat && branchId) {
        query = query.eq('pd_scope', branchId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter.toUpperCase());
      }

      const { data, error } = await query;
      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data tagihan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (payment: any) => {
    setSelectedPayment(payment);
    setDetailLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('payment_items')
        .select(`
          *,
          members(npa, nama)
        `)
        .eq('payment_group_id', payment.id);

      if (error) throw error;
      setPaymentItems(data || []);
    } catch (error: any) {
      console.error('Error fetching payment items:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat detail pembayaran',
        variant: 'destructive',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payment_groups')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Tagihan berhasil ditandai lunas',
      });

      fetchPayments();
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Lunas
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="destructive">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(p =>
    p.group_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari invoice atau metode..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
          <CardDescription>{filteredPayments.length} tagihan ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada tagihan ditemukan</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Invoice</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expired/Paid At</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm font-semibold">
                          {payment.group_code}
                        </TableCell>
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
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.status === 'PAID' && payment.paid_at
                            ? format(new Date(payment.paid_at), 'dd MMM yyyy, HH:mm', { locale: id })
                            : payment.expired_at
                            ? format(new Date(payment.expired_at), 'dd MMM yyyy', { locale: id })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDetails(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono font-semibold text-sm">{payment.group_code}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground text-xs">Metode</p>
                          <Badge variant="outline" className="mt-1">
                            {payment.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Total</p>
                          <p className="font-bold text-primary mt-1">{formatRupiah(payment.total_payable)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {payment.status === 'PAID' && payment.paid_at
                            ? `Paid: ${format(new Date(payment.paid_at), 'dd MMM HH:mm', { locale: id })}`
                            : payment.expired_at
                            ? `Exp: ${format(new Date(payment.expired_at), 'dd MMM', { locale: id })}`
                            : '-'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(payment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Tagihan</SheetTitle>
            <SheetDescription>
              Invoice {selectedPayment?.group_code}
            </SheetDescription>
          </SheetHeader>
          
          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{selectedPayment && getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg text-primary mt-1">
                    {selectedPayment && formatRupiah(selectedPayment.total_payable)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Metode</p>
                  <p className="font-medium mt-1">
                    {selectedPayment?.method === 'qris' ? 'QRIS' : 'Transfer Bank'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Dibuat</p>
                  <p className="font-medium mt-1">
                    {selectedPayment && format(new Date(selectedPayment.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Item Pembayaran</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NPA</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tahun</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.npa}</TableCell>
                          <TableCell className="font-medium">{(item.members as any)?.nama}</TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell className="text-right text-primary font-semibold">
                            {formatRupiah(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
