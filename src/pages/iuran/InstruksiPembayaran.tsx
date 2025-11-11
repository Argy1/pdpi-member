import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Building2, Copy, Upload, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InstruksiPembayaran() {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [file, setFile] = useState<File | null>(null);

  // Dummy data
  const invoice = {
    groupCode: groupCode || 'INV123456',
    amount: 1500000,
    method: 'qris', // or 'transfer'
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
  };

  const bankDetails = {
    bank: 'Bank Mega Syariah',
    accountNumber: '1234567890',
    accountName: 'PDPI Pusat'
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadProof = () => {
    // Upload proof logic
    navigate(`/invoice/${groupCode}`);
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
              <p className="text-muted-foreground">Kode Invoice: {invoice.groupCode}</p>
            </div>
            <Badge variant={timeLeft > 0 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
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
                  {invoice.method === 'qris' ? (
                    <><QrCode className="h-5 w-5" /> Pembayaran QRIS</>
                  ) : (
                    <><Building2 className="h-5 w-5" /> Transfer Bank</>
                  )}
                </CardTitle>
                <CardDescription>Total pembayaran yang harus dibayarkan</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {invoice.method === 'qris' ? (
                  <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-primary/30">
                      <div className="w-64 h-64 bg-muted flex items-center justify-center rounded-lg">
                        <QrCode className="h-32 w-32 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Pembayaran</p>
                      <p className="text-3xl font-bold text-primary">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                    </div>
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
                      <p className="text-sm text-muted-foreground mb-1">Jumlah Transfer</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-primary">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(invoice.amount.toString())}>
                          <Copy className="h-4 w-4 mr-2" />
                          Salin
                        </Button>
                      </div>
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
                          disabled={!file}
                          className="w-full mt-3"
                          size="lg"
                        >
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
                {invoice.method === 'qris' ? (
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
                        <p className="text-sm text-muted-foreground">Status akan otomatis diperbarui setelah pembayaran berhasil</p>
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
                        <p className="text-sm text-muted-foreground">Pastikan nominal transfer sesuai dengan yang tertera</p>
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
                  <li>• Pastikan nominal transfer sesuai dengan yang tertera</li>
                  <li>• Selesaikan pembayaran sebelum waktu habis</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
