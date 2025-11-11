import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, ArrowLeft, CheckCircle, Printer, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function InvoiceDetail() {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentGroup, setPaymentGroup] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoiceData();
  }, [groupCode]);

  const fetchInvoiceData = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('payment_groups')
        .select('*')
        .eq('group_code', groupCode)
        .single();

      if (groupError) throw groupError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('payment_items')
        .select(`
          *,
          members(nama, npa)
        `)
        .eq('payment_group_id', groupData.id);

      if (itemsError) throw itemsError;

      setPaymentGroup(groupData);
      setItems(itemsData || []);
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // PDF download logic - for now just print
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            LUNAS
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" />
            MENUNGGU
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentGroup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Invoice tidak ditemukan</p>
            <Button onClick={() => navigate('/iuran/riwayat')} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by member
  const groupedItems = items.reduce((acc, item) => {
    const key = item.member_id;
    if (!acc[key]) {
      acc[key] = {
        npa: item.members?.npa || item.npa,
        name: item.members?.nama || 'Unknown',
        years: [],
        totalAmount: 0
      };
    }
    acc[key].years.push(item.year);
    acc[key].totalAmount += item.amount;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => navigate('/iuran/riwayat')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Unduh PDF
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <Card className="shadow-lg">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo-pdpi.png" alt="PDPI Logo" className="h-16 w-16 object-contain" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">PDPI</h1>
                  <p className="text-sm text-muted-foreground">Perhimpunan Dokter Paru Indonesia</p>
                  <p className="text-xs text-muted-foreground mt-1">Jl. Cipinang Bunder No. 19, Jakarta Timur</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(paymentGroup.status)}
                <p className="text-2xl font-bold text-primary mt-2">INVOICE</p>
                <p className="text-sm text-muted-foreground font-mono">{paymentGroup.group_code}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Dibuat Untuk:</h3>
                <p className="font-semibold text-lg">
                  {items.length > 1 ? `Pembayaran Kolektif (${Object.keys(groupedItems).length} anggota)` : items[0]?.members?.nama || 'Pembayaran Iuran'}
                </p>
                <p className="text-sm text-muted-foreground">Metode: {paymentGroup.method === 'qris' ? 'QRIS' : 'Transfer Bank'}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground">Tanggal Invoice: </span>
                    <span className="font-medium">
                      {format(new Date(paymentGroup.created_at), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Jatuh Tempo: </span>
                    <span className="font-medium">
                      {paymentGroup.expired_at ? format(new Date(paymentGroup.expired_at), 'dd MMMM yyyy HH:mm', { locale: id }) : '-'}
                    </span>
                  </div>
                  {paymentGroup.paid_at && (
                    <div>
                      <span className="text-sm text-muted-foreground">Tanggal Bayar: </span>
                      <span className="font-medium text-green-600">
                        {format(new Date(paymentGroup.paid_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Detail Pembayaran</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">NPA</th>
                      <th className="text-left p-3 text-sm font-semibold">Nama Anggota</th>
                      <th className="text-center p-3 text-sm font-semibold">Tahun</th>
                      <th className="text-right p-3 text-sm font-semibold">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedItems).map((item: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3 font-mono text-sm">{item.npa}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-center">{item.years.sort().join(', ')}</td>
                        <td className="p-3 text-right font-medium">{formatRupiah(item.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatRupiah(paymentGroup.amount_base)}</span>
                </div>
                {paymentGroup.method === 'bank_transfer' && paymentGroup.unique_code > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kode Unik:</span>
                    <span className="font-medium">{formatRupiah(paymentGroup.unique_code)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Admin:</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatRupiah(paymentGroup.total_payable)}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-muted/50 p-4 rounded-lg border text-sm text-center text-muted-foreground">
              <p>
                {paymentGroup.status === 'PAID' 
                  ? 'Terima kasih atas pembayaran Anda. Invoice ini merupakan bukti pembayaran yang sah.'
                  : 'Silakan selesaikan pembayaran sesuai instruksi yang diberikan.'
                }
              </p>
              <p className="mt-1">Untuk pertanyaan, hubungi: iuran@pdpi.org | +62 21 1234 5678</p>
            </div>
          </CardContent>
        </Card>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .container, .container * {
              visibility: visible;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
