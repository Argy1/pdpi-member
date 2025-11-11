import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Building2, QrCode, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('qris');

  // Dummy cart data
  const cartItems = [
    { id: 1, npa: '12345', nama: 'Dr. Ahmad Suryadi, Sp.P', years: 1, amount: 500000 },
    { id: 2, npa: '12346', nama: 'Dr. Budi Santoso, Sp.P', years: 2, amount: 1000000 }
  ];

  const subtotal: number = cartItems.reduce((sum, item) => sum + item.amount, 0);
  const adminFee: number = 0; // Free for QRIS
  const total: number = subtotal + adminFee;

  const handleCreateInvoice = () => {
    const groupCode = 'INV' + Date.now();
    navigate(`/iuran/instruksi/${groupCode}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          </div>
          <p className="text-muted-foreground">Tinjau pesanan dan pilih metode pembayaran</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items List */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>{cartItems.length} item dalam keranjang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.nama}</p>
                      <p className="text-sm text-muted-foreground">NPA: {item.npa}</p>
                      <Badge variant="outline" className="mt-1">
                        {item.years} Tahun
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">Rp {item.amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Metode Pembayaran
                </CardTitle>
                <CardDescription>Pilih metode pembayaran yang Anda inginkan</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <RadioGroupItem value="qris" id="qris" />
                    <Label htmlFor="qris" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <QrCode className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-semibold">QRIS</p>
                            <p className="text-sm text-muted-foreground">Bayar dengan scan QR code</p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Direkomendasikan
                        </Badge>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-lg border">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-semibold">Transfer Bank Mega Syariah</p>
                          <p className="text-sm text-muted-foreground">Transfer manual ke rekening PDPI</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'qris' && (
                  <Alert className="mt-4 border-primary/20 bg-primary/5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Pembayaran QRIS otomatis terverifikasi dalam hitungan detik tanpa biaya admin
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-primary/20 sticky top-6">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle>Total Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cartItems.length} item)</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Admin</span>
                    <span className="font-medium text-green-600">
                      {adminFee === 0 ? 'Gratis' : `Rp ${adminFee.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <Button onClick={handleCreateInvoice} className="w-full mt-6" size="lg">
                  Buat Tagihan
                </Button>

                <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                  <p>✓ Data pembayaran terenkripsi dengan aman</p>
                  <p>✓ Invoice otomatis dikirim ke email</p>
                  <p>✓ Dapat dibatalkan sebelum pembayaran</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
