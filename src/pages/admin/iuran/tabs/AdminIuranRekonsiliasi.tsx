import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCcw, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminIuranRekonsiliasi() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

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
        description: 'Gagal memuat webhook logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (logId: string) => {
    toast({
      title: 'Info',
      description: 'Fitur reprocess sedang dalam pengembangan',
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qris" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="qris" className="text-sm sm:text-base">QRIS Webhook</TabsTrigger>
          <TabsTrigger value="transfer" className="text-sm sm:text-base">Transfer Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="qris" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QRIS Webhook Log</CardTitle>
              <CardDescription>Riwayat webhook dari payment gateway QRIS</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : webhookLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Belum ada webhook log</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Gateway</TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead>Processed</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss', { locale: id })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.gateway || '-'}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{log.order_id || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={log.status_parsed === 'success' ? 'default' : 'destructive'}>
                                {log.status_parsed || 'unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.verified ? (
                                <Badge className="bg-green-500">Yes</Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {log.processed_at ? (
                                <Badge className="bg-blue-500">
                                  {format(new Date(log.processed_at), 'HH:mm', { locale: id })}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReprocess(log.id)}
                                disabled={!!log.processed_at}
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {webhookLogs.map((log) => (
                      <Card key={log.id} className="border">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                              </p>
                              <p className="font-mono text-sm mt-1">{log.order_id || '-'}</p>
                            </div>
                            <Badge variant={log.status_parsed === 'success' ? 'default' : 'destructive'}>
                              {log.status_parsed || 'unknown'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                            <div>
                              <p className="text-muted-foreground text-xs">Gateway</p>
                              <Badge variant="outline" className="mt-1">{log.gateway || '-'}</Badge>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Verified</p>
                              {log.verified ? (
                                <Badge className="bg-green-500 mt-1">Yes</Badge>
                              ) : (
                                <Badge variant="outline" className="mt-1">No</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            {log.processed_at ? (
                              <Badge className="bg-blue-500">
                                Processed: {format(new Date(log.processed_at), 'HH:mm', { locale: id })}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReprocess(log.id)}
                              disabled={!!log.processed_at}
                            >
                              <RefreshCcw className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rekonsiliasi Transfer Manual</CardTitle>
              <CardDescription>Upload CSV mutasi bank untuk pencocokan otomatis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Upload file CSV mutasi rekening Bank Mega Syariah
                  </p>
                  <Button disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV (Coming Soon)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Fitur ini sedang dalam pengembangan
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Cara Kerja:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Upload CSV mutasi bank</li>
                    <li>Sistem akan mencocokkan total_payable (base + unique_code)</li>
                    <li>Cek rentang waktu transaksi dengan created_at</li>
                    <li>Approve untuk update status menjadi PAID</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
