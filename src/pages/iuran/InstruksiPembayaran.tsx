import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Building2, Copy, Upload, CheckCircle, Clock, AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';

export default function InstruksiPembayaran() {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentGroup, setPaymentGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [qrisData, setQrisData] = useState<any>(null);

  useEffect(() => {
    fetchPaymentGroup();
    
    // Poll for status changes
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [groupCode]);

  useEffect(() => {
    if (!paymentGroup?.expired_at) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(paymentGroup.expired_at).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [paymentGroup]);

  const fetchPaymentGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_groups')
        .select(`
          *,
          payment_items(
            id,
            member_id,
            npa,
            year,
            amount,
            members(nama)
          )
        `)
        .eq('group_code', groupCode)
        .single();

      if (error) throw error;
      setPaymentGroup(data);

      // Create QRIS if needed
      if (data.method === 'qris' && !data.qris_payload) {
        await createQRIS(data);
      } else if (data.qris_payload) {
        setQrisData(data.qris_payload);
      }
    } catch (error: any) {
      console.error('Error fetching payment group:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data pembayaran',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createQRIS = async (group: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('qris-create', {
        body: {
          group_code: group.group_code,
          amount: group.total_payable
        }
      });

      if (error) throw error;

      const qrisInfo = data.data;
      setQrisData(qrisInfo);

      // Update payment group with QRIS data
      await supabase
        .from('payment_groups')
        .update({
          qris_payload: qrisInfo,
          gateway_tx_id: qrisInfo.gateway_tx_id
        })
        .eq('id', group.id);

    } catch (error: any) {
      console.error('Error creating QRIS:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat QRIS',
        variant: 'destructive'
      });
    }
  };

  const checkPaymentStatus = async () => {
    if (!groupCode) return;
    
    const { data } = await supabase
      .from('payment_groups')
      .select('status')
      .eq('group_code', groupCode)
      .single();

    if (data?.status === 'PAID') {
      toast({
        title: 'Pembayaran Berhasil!',
        description: 'Pembayaran Anda telah dikonfirmasi'
      });
      navigate(`/invoice/${groupCode}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!file || !paymentGroup) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${paymentGroup.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update payment group with proof URL
      const { error: updateError } = await supabase
        .from('payment_groups')
        .update({ transfer_proof_url: publicUrl })
        .eq('id', paymentGroup.id);

      if (updateError) throw updateError;

      toast({
        title: 'Bukti Transfer Berhasil Diunggah',
        description: 'Admin akan memverifikasi dalam 1x24 jam'
      });

      navigate(`/invoice/${groupCode}`);
    } catch (error: any) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSimulatePayment = async () => {
    // FAKE MODE: Simulate payment for testing
    try {
      await supabase.functions.invoke('qris-webhook', {
        body: {
          gateway: 'fake_qris',
          order_id: groupCode,
          status: 'PAID'
        }
      });

      toast({
        title: 'Pembayaran Disimulasi',
        description: 'Status akan diperbarui dalam beberapa detik'
      });
    } catch (error: any) {
      console.error('Error simulating payment:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 600) return 'bg-green-500'; // > 10 mins
    if (timeLeft > 300) return 'bg-amber-500'; // > 5 mins
    return 'bg-red-500';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Berhasil Disalin',
      description: 'Teks telah disalin ke clipboard'
    });
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
            <Button onClick={() => navigate('/iuran')} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bankDetails = {
    bank: 'Bank Mega Syariah',
    accountNumber: '010.01.0003.6734',
    accountName: 'PDPI Pusat'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/iuran')} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Instruksi Pembayaran</h1>
              <p className="text-muted-foreground">Kode Invoice: {paymentGroup.group_code}</p>
            </div>
            <Badge variant={timeLeft > 0 ? 'default' : 'destructive'} className={`text-lg px-4 py-2 ${getTimerColor()}`}>
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Payment Info */}
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  {paymentGroup.method === 'qris' ? (
                    <><QrCode className="h-5 w-5" /> Pembayaran QRIS</>
                  ) : (
                    <><Building2 className="h-5 w-5" /> Transfer Bank</>
                  )}
                </CardTitle>
                <CardDescription>Total pembayaran yang harus dibayarkan</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {paymentGroup.method === 'qris' ? (
                  <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-primary/30">
                      {qrisData?.qr_image_url ? (
                        <img 
                          src={qrisData.qr_image_url} 
                          alt="QR Code" 
                          className="w-64 h-64 object-contain"
                        />
                      ) : (
                        <div className="w-64 h-64 bg-muted flex items-center justify-center rounded-lg">
                          <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Pembayaran</p>
                      <p className="text-3xl font-bold text-primary">{formatRupiah(paymentGroup.total_payable)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Bayar dengan nominal pas (tanpa kode unik)</p>
                    </div>

                    {/* FAKE MODE: Simulate payment button */}
                    <Button 
                      onClick={handleSimulatePayment} 
                      variant="outline" 
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      [TEST] Simulasi Pembayaran Berhasil
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Nama Bank</p>
                      <p className="font-semibold text-lg">{bankDetails.bank}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Nomor Rekening</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-lg">{bankDetails.accountNumber}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(bankDetails.accountNumber)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Nama Penerima</p>
                      <p className="font-semibold text-lg">{bankDetails.accountName}</p>
                    </div>

                    <Separator />

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Jumlah Transfer (PERSIS)</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-primary">{formatRupiah(paymentGroup.total_payable)}</p>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(paymentGroup.total_payable.toString())}>
                          <Copy className="h-4 w-4 mr-2" />
                          Salin
                        </Button>
                      </div>
                      <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Jangan membulatkan nominal. Transfer PERSIS sesuai jumlah di atas.</p>
                    </div>

                    {/* Upload Proof */}
                    <Card className="border-2 border-dashed">
                      <CardContent className="pt-6">
                        <Label htmlFor="proof" className="text-sm font-medium mb-2 block">
                          Upload Bukti Transfer
                        </Label>
                        <Input
                          id="proof"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mb-3"
                        />
                        {file && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">{file.name}</span>
                          </div>
                        )}
                        <Button
                          onClick={handleUploadProof}
                          disabled={!file || uploading}
                          className="w-full mt-3"
                          size="lg"
                        >
                          {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Upload className="h-4 w-4 mr-2" />
                          Kirim Bukti Transfer
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Langkah-langkah Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentGroup.method === 'qris' ? (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Buka aplikasi e-wallet atau mobile banking</p>
                        <p className="text-sm text-muted-foreground">GoPay, OVO, Dana, LinkAja, atau aplikasi bank Anda</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Scan QR Code di atas</p>
                        <p className="text-sm text-muted-foreground">Pilih menu scan dan arahkan ke QR code</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Konfirmasi pembayaran</p>
                        <p className="text-sm text-muted-foreground">Status akan otomatis diperbarui setelah pembayaran berhasil (maksimal 1 menit)</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Transfer ke rekening di atas</p>
                        <p className="text-sm text-muted-foreground">Pastikan nominal transfer PERSIS sesuai yang tertera (termasuk kode unik)</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Simpan bukti transfer</p>
                        <p className="text-sm text-muted-foreground">Screenshot atau foto struk dari ATM/mobile banking</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Upload bukti transfer</p>
                        <p className="text-sm text-muted-foreground">Gunakan form di sebelah kiri untuk mengunggah bukti</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Tunggu verifikasi</p>
                        <p className="text-sm text-muted-foreground">Admin akan memverifikasi dalam 1x24 jam</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="font-semibold mb-2">Tips Keamanan:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Jangan bagikan kode OTP atau PIN Anda kepada siapapun</li>
                  <li>• {paymentGroup.method === 'bank_transfer' ? 'Transfer PERSIS sesuai nominal (jangan dibulatkan)' : 'Pastikan nominal pembayaran sesuai'}</li>
                  <li>• Selesaikan pembayaran sebelum waktu habis</li>
                  <li>• Simpan bukti pembayaran untuk keperluan verifikasi</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
