import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Eye, CheckCircle, Send, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function AdminKelolaTagihan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminPusat, branchId, loading: authLoading } = useAdminAccess();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchInvoices();
    }
  }, [authLoading, statusFilter, branchId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('payment_groups')
        .select(`
          *,
          payment_items(
            id,
            member_id,
            npa,
            year,
            amount,
            status,
            members(nama)
          )
        `)
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (!isAdminPusat && branchId) {
        query = query.eq('pd_scope', branchId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter.toUpperCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('payment_groups')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Tagihan berhasil ditandai sebagai lunas'
      });

      fetchInvoices();
      setIsSheetOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = async (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
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

  const filteredInvoices = invoices.filter(inv =>
    inv.group_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    pending: invoices.filter(i => i.status === 'PENDING').length,
    paid: invoices.filter(i => i.status === 'PAID' && new Date(i.paid_at).toDateString() === new Date().toDateString()).length,
    expired: invoices.filter(i => i.status === 'EXPIRED').length
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Tagihan</h1>
        <p className="text-muted-foreground">Monitor dan verifikasi invoice pembayaran iuran</p>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode invoice..."
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
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="expired">Kadaluarsa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lunas Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
          <CardDescription>{filteredInvoices.length} invoice ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
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
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium font-mono text-sm">{invoice.group_code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {format(new Date(invoice.created_at), 'dd MMM yyyy', { locale: id })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(invoice.created_at), 'HH:mm', { locale: id })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.method === 'qris' ? 'QRIS' : 'Transfer'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatRupiah(invoice.total_payable)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/invoice/${invoice.group_code}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'PENDING' && invoice.method === 'bank_transfer' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
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

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Invoice</SheetTitle>
            <SheetDescription>
              {selectedInvoice?.group_code}
            </SheetDescription>
          </SheetHeader>
          
          {selectedInvoice && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <p className="text-xl font-bold text-primary">{formatRupiah(selectedInvoice.total_payable)}</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Metode Pembayaran</p>
                <Badge variant="outline">{selectedInvoice.method === 'qris' ? 'QRIS' : 'Transfer Bank'}</Badge>
              </div>

              {selectedInvoice.transfer_proof_url && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Bukti Transfer</p>
                  <img 
                    src={selectedInvoice.transfer_proof_url} 
                    alt="Bukti Transfer"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              <div>
                <p className="font-semibold mb-2">Item Pembayaran ({selectedInvoice.payment_items?.length || 0})</p>
                <div className="space-y-2">
                  {selectedInvoice.payment_items?.map((item: any) => (
                    <div key={item.id} className="p-3 rounded-lg border bg-muted/20">
                      <p className="font-medium">{item.members?.nama || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">NPA: {item.npa} - Tahun {item.year}</p>
                      <p className="text-sm font-semibold text-primary">{formatRupiah(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInvoice.status === 'PENDING' && selectedInvoice.method === 'bank_transfer' && (
                <Button 
                  onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tandai Sebagai Lunas
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
