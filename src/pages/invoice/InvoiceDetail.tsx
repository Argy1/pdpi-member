import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, ArrowLeft, CheckCircle, Printer } from 'lucide-react';

export default function InvoiceDetail() {
  const { groupCode } = useParams();
  const navigate = useNavigate();

  // Dummy invoice data
  const invoice = {
    code: groupCode || 'INV202501001',
    date: '15 Januari 2025',
    dueDate: '31 Januari 2025',
    paidDate: '16 Januari 2025',
    status: 'paid',
    paymentMethod: 'QRIS',
    payer: {
      name: 'Dr. Ahmad Suryadi, Sp.P',
      npa: '12345',
      email: 'ahmad.suryadi@email.com',
      cabang: 'DKI Jakarta'
    },
    items: [
      { npa: '12345', name: 'Dr. Ahmad Suryadi, Sp.P', period: '2025', years: 1, amount: 500000 },
      { npa: '12346', name: 'Dr. Budi Santoso, Sp.P', period: '2025', years: 1, amount: 500000 }
    ],
    subtotal: 1000000,
    adminFee: 0,
    total: 1000000
  };

  const handleDownloadPDF = () => {
    // PDF download logic
    console.log('Downloading PDF...');
  };

  const handlePrint = () => {
    window.print();
  };

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
                <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="mb-2 bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  LUNAS
                </Badge>
                <p className="text-2xl font-bold text-primary">INVOICE</p>
                <p className="text-sm text-muted-foreground font-mono">{invoice.code}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Dibayar Oleh:</h3>
                <p className="font-semibold text-lg">{invoice.payer.name}</p>
                <p className="text-sm text-muted-foreground">NPA: {invoice.payer.npa}</p>
                <p className="text-sm text-muted-foreground">{invoice.payer.cabang}</p>
                <p className="text-sm text-muted-foreground">{invoice.payer.email}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground">Tanggal Invoice: </span>
                    <span className="font-medium">{invoice.date}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Jatuh Tempo: </span>
                    <span className="font-medium">{invoice.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tanggal Bayar: </span>
                    <span className="font-medium text-green-600">{invoice.paidDate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Metode: </span>
                    <Badge variant="outline">{invoice.paymentMethod}</Badge>
                  </div>
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
                      <th className="text-center p-3 text-sm font-semibold">Periode</th>
                      <th className="text-center p-3 text-sm font-semibold">Tahun</th>
                      <th className="text-right p-3 text-sm font-semibold">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3 font-mono text-sm">{item.npa}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-center">{item.period}</td>
                        <td className="p-3 text-center">{item.years} Tahun</td>
                        <td className="p-3 text-right font-medium">Rp {item.amount.toLocaleString('id-ID')}</td>
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
                  <span className="font-medium">Rp {invoice.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Admin:</span>
                  <span className="font-medium text-green-600">
                    {invoice.adminFee === 0 ? 'Gratis' : `Rp ${invoice.adminFee.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">Rp {invoice.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-muted/50 p-4 rounded-lg border text-sm text-center text-muted-foreground">
              <p>Terima kasih atas pembayaran Anda. Invoice ini merupakan bukti pembayaran yang sah.</p>
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
