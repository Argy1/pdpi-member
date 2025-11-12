import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminRekonsiliasi() {
  const { toast } = useToast();
  const { isAdminPusat, loading: authLoading } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && isAdminPusat) {
      fetchWebhookLogs();
    }
  }, [authLoading, isAdminPusat]);

  const fetchWebhookLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching webhook logs:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'SUCCESS':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Berhasil
          </Badge>
        );
      case 'FAILED':
      case 'ERROR':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="bg-amber-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status || 'Unknown'}
          </Badge>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminPusat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Hanya Admin Pusat yang dapat mengakses halaman ini</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={fetchWebhookLogs}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {webhookLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Belum ada log webhook</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Gateway</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss', { locale: id }) : '-'}
                          </TableCell>
                          <TableCell className="font-medium">{log.order_id || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.gateway || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status_parsed)}</TableCell>
                          <TableCell>
                            {log.verified ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Webhook Aktif
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Webhook endpoint: <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                  {`${window.location.origin}/api/webhook/qris`}
                </code>
              </p>
              <p className="text-sm text-muted-foreground">
                Pembayaran QRIS akan otomatis diverifikasi dalam hitungan detik setelah berhasil.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Rekonsiliasi Transfer Manual</CardTitle>
              <CardDescription>
                Untuk transfer bank, admin perlu memverifikasi manual dengan melihat bukti transfer yang diunggah oleh pembayar.
                Gunakan halaman "Kelola Tagihan" untuk verifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Fitur upload CSV mutasi rekening akan segera hadir</p>
                <p className="text-sm">Untuk saat ini, gunakan halaman Kelola Tagihan untuk verifikasi manual</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
