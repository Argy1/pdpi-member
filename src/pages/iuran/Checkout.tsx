import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Building2, QrCode, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentCart } from '@/hooks/usePaymentCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateGroupCode, calculateExpiry, formatRupiah, TARIFF_PER_YEAR } from '@/utils/paymentHelpers';

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalAmount, clearCart } = usePaymentCart();
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_transfer'>('qris');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*, branches(id, name)')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    }
  };

  const subtotal = getTotalAmount();
  const adminFee = 0; // Free for both methods
  const uniqueCode = paymentMethod === 'bank_transfer' ? Math.floor(Math.random() * 900) + 100 : 0;
  const total = subtotal + uniqueCode;

  const handleCreateInvoice = async () => {
    if (items.length === 0) {
      toast({
        title: 'Keranjang Kosong',
        description: 'Silakan tambahkan item terlebih dahulu',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const groupCode = generateGroupCode();
      const expiredAt = calculateExpiry(paymentMethod);

      // Create payment group
      const { data: paymentGroup, error: groupError } = await supabase
        .from('payment_groups')
        .insert({
          group_code: groupCode,
          created_by: user.id,
          method: paymentMethod,
          amount_base: subtotal,
          unique_code: uniqueCode,
          total_payable: total,
          status: 'PENDING',
          expired_at: expiredAt.toISOString(),
          pd_scope: profile?.branch_id || null
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Create payment items
      const paymentItems = items.flatMap(item => 
        item.years.map(year => ({
          payment_group_id: paymentGroup.id,
          member_id: item.memberId,
          npa: item.npa,
          year,
          amount: TARIFF_PER_YEAR,
          status: 'PENDING'
        }))
      );

      const { error: itemsError } = await supabase
        .from('payment_items')
        .insert(paymentItems);

      if (itemsError) throw itemsError;

      // Clear cart
      clearCart();

      toast({
        title: 'Tagihan Berhasil Dibuat',
        description: `Invoice ${groupCode} telah dibuat`
      });

      navigate(`/iuran/instruksi/${groupCode}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
                <CardDescription>{items.length} anggota dalam keranjang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.memberId} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.memberName}</p>
                      <p className="text-sm text-muted-foreground">NPA: {item.npa}</p>
                      <Badge variant="outline" className="mt-1">
                        {item.years.length} Tahun: {item.years.join(', ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatRupiah(item.years.length * TARIFF_PER_YEAR)}</p>
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
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'qris' | 'bank_transfer')} className="space-y-3">
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
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatRupiah(subtotal)}</span>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kode Unik</span>
                      <span className="font-medium text-primary">{formatRupiah(uniqueCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Admin</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateInvoice} 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={loading || items.length === 0}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
