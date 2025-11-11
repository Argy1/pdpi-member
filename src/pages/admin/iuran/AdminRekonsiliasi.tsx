import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function AdminRekonsiliasi() {
  const [file, setFile] = useState<File | null>(null);

  // Dummy webhook logs
  const webhookLogs = [
    {
      id: 1,
      invoice: 'INV202501001',
      amount: 500000,
      status: 'success',
      provider: 'QRIS',
      timestamp: '15 Jan 2025 14:30:45'
    },
    {
      id: 2,
      invoice: 'INV202501005',
      amount: 1000000,
      status: 'success',
      provider: 'QRIS',
      timestamp: '15 Jan 2025 10:15:22'
    },
    {
      id: 3,
      invoice: 'INV202501008',
      amount: 500000,
      status: 'failed',
      provider: 'QRIS',
      timestamp: '14 Jan 2025 16:45:10'
    }
  ];

  // Dummy transfer data
  const transfers = [
    {
      id: 1,
      date: '15 Jan 2025',
      amount: 500000,
      sender: 'Ahmad Suryadi',
      description: 'INV202501002',
      status: 'matched'
    },
    {
      id: 2,
      date: '16 Jan 2025',
      amount: 1500000,
      sender: 'Budi Santoso',
      description: 'Transfer Iuran',
      status: 'unmatched'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
      case 'matched':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === 'success' ? 'Berhasil' : 'Cocok'}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </Badge>
        );
      case 'unmatched':
        return (
          <Badge variant="default" className="bg-amber-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Belum Cocok
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Rekonsiliasi Pembayaran</h1>
        <p className="text-muted-foreground">Monitor webhook QRIS dan rekonsiliasi transfer manual</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="webhook">Webhook QRIS</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Manual</TabsTrigger>
        </TabsList>

        {/* Webhook Tab */}
        <TabsContent value="webhook" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Log Webhook QRIS</CardTitle>
                  <CardDescription>Notifikasi pembayaran realtime dari payment gateway</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.invoice}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          Rp {log.amount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Webhook Aktif
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Webhook endpoint: <code className="bg-muted px-2 py-1 rounded text-xs">https://api.pdpi.org/webhook/qris</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Pembayaran QRIS akan otomatis diverifikasi dalam hitungan detik setelah berhasil.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer" className="space-y-6">
          {/* Upload CSV */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Upload Mutasi Rekening</CardTitle>
              <CardDescription>Upload file CSV mutasi dari Bank Mega Syariah untuk rekonsiliasi otomatis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-file">File CSV Mutasi Rekening</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                {file && (
                  <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{file.name}</span>
                  </div>
                )}
              </div>
              <Button disabled={!file} className="gap-2">
                <Upload className="h-4 w-4" />
                Proses Rekonsiliasi
              </Button>
            </CardContent>
          </Card>

          {/* Transfer List */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Daftar Transfer Masuk</CardTitle>
              <CardDescription>Transfer yang perlu dicocokkan dengan invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pengirim</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>{transfer.date}</TableCell>
                        <TableCell className="font-medium">{transfer.sender}</TableCell>
                        <TableCell>{transfer.description}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          Rp {transfer.amount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell className="text-center">
                          {transfer.status === 'unmatched' && (
                            <Button variant="outline" size="sm">
                              Cocokkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
