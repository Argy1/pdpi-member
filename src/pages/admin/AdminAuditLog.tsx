import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Search, Eye, RefreshCw, FileText, Database, GitPullRequest } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_fields: string[];
  changed_by: string | null;
  changed_at: string;
}

export default function AdminAuditLog() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, [tableFilter, actionFilter, currentPage]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('changed_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs((data as any) || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat log audit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Tambah</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Update</Badge>;
      case 'DELETE':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Hapus</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'members':
        return <Database className="h-4 w-4" />;
      case 'member_change_requests':
        return <GitPullRequest className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      members: 'Anggota',
      member_change_requests: 'Usulan Perubahan',
      profiles: 'Profil User',
      branches: 'Cabang',
    };
    return labels[tableName] || tableName;
  };

  const renderChangedFields = (log: AuditLog) => {
    if (!log.changed_fields || log.changed_fields.length === 0) {
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    const fieldLabels: Record<string, string> = {
      nama: 'Nama',
      npa: 'NPA',
      email: 'Email',
      no_hp: 'No. HP',
      cabang: 'Cabang',
      status: 'Status',
      tempat_praktek_1: 'Tempat Praktek 1',
      tempat_praktek_1_tipe: 'Tipe Praktek 1',
      tempat_praktek_1_alkes: 'Alkes Praktek 1',
    };

    return (
      <div className="flex flex-wrap gap-1">
        {log.changed_fields.slice(0, 3).map((field) => (
          <Badge key={field} variant="outline" className="text-xs">
            {fieldLabels[field] || field}
          </Badge>
        ))}
        {log.changed_fields.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{log.changed_fields.length - 3} lagi
          </Badge>
        )}
      </div>
    );
  };

  const renderDetailDialog = (log: AuditLog) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Detail Log Audit</AlertDialogTitle>
            <AlertDialogDescription>
              {getActionBadge(log.action)} pada {getTableLabel(log.table_name)} - {format(new Date(log.changed_at), 'dd MMMM yyyy HH:mm:ss', { locale: localeId })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 mt-4">
            {log.action === 'UPDATE' && log.old_data && log.new_data && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Data Lama</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(log.old_data, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Data Baru</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {log.action === 'INSERT' && log.new_data && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Data yang Ditambahkan</h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(log.new_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {log.action === 'DELETE' && log.old_data && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Data yang Dihapus</h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(log.old_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {log.changed_fields && log.changed_fields.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Field yang Berubah</h4>
                <div className="flex flex-wrap gap-2">
                  {log.changed_fields.map((field) => (
                    <Badge key={field} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Tutup</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Log lengkap semua perubahan data dalam sistem
          </p>
        </div>
        <Button onClick={fetchAuditLogs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Filter log berdasarkan tabel dan aksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tabel</Label>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua tabel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tabel</SelectItem>
                  <SelectItem value="members">Anggota</SelectItem>
                  <SelectItem value="member_change_requests">Usulan Perubahan</SelectItem>
                  <SelectItem value="profiles">Profil User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aksi</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  <SelectItem value="INSERT">Tambah</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Hapus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cari Record ID</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan record ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>History Log</CardTitle>
          <CardDescription>
            Total {logs.length} log ditampilkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada log audit</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Tabel</TableHead>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Field yang Berubah</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead className="text-right">Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-sm">
                          {format(new Date(log.changed_at), 'dd/MM/yy HH:mm', { locale: localeId })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTableIcon(log.table_name)}
                            <span className="text-sm">{getTableLabel(log.table_name)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>{renderChangedFields(log)}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.record_id.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          {renderDetailDialog(log)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
