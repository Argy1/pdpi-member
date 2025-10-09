import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChangeRequestWithMember } from '@/types/changeRequest';

export default function AdminChangeRequests() {
  const { isPusatAdmin, isCabangAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ChangeRequestWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('member_change_requests')
        .select(`
          *,
          member:members(nama, npa, cabang)
        `)
        .order('created_at', { ascending: false });

      // Admin Cabang hanya bisa lihat request mereka sendiri
      if (isCabangAdmin && !isPusatAdmin) {
        query = query.eq('requested_by', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRequests(data as any || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar usulan perubahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, changes: Record<string, any>, memberId: string) => {
    try {
      // Update member data
      const { error: updateError } = await supabase
        .from('members')
        .update(changes)
        .eq('id', memberId);

      if (updateError) throw updateError;

      // Update request status
      const { error: requestError } = await supabase
        .from('member_change_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      toast({
        title: 'Usulan Disetujui',
        description: 'Perubahan data telah diterapkan',
      });

      fetchChangeRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyetujui usulan perubahan',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('member_change_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Usulan Ditolak',
        description: 'Perubahan data tidak diterapkan',
      });

      setRejectionReason('');
      fetchChangeRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Gagal menolak usulan perubahan',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderChanges = (changes: Record<string, any>) => {
    const fieldLabels: Record<string, string> = {
      nama: 'Nama',
      gelar: 'Gelar',
      gelar2: 'Gelar 2',
      alumni: 'Alumni',
      tgl_lahir: 'Tanggal Lahir',
      tempat_lahir: 'Tempat Lahir',
      jenis_kelamin: 'Jenis Kelamin',
      thn_lulus: 'Tahun Lulus',
      tempat_tugas: 'Unit Kerja',
      tempat_praktek_1: 'Tempat Praktek 1',
      tempat_praktek_1_tipe: 'Tipe Praktek 1',
      tempat_praktek_2: 'Tempat Praktek 2',
      tempat_praktek_2_tipe: 'Tipe Praktek 2',
      tempat_praktek_3: 'Tempat Praktek 3',
      tempat_praktek_3_tipe: 'Tipe Praktek 3',
      kota_kabupaten_kantor: 'Kota/Kab Kantor',
      provinsi_kantor: 'Provinsi Kantor',
      alamat_rumah: 'Alamat Rumah',
      kota_kabupaten_rumah: 'Kota/Kab Rumah',
      provinsi_rumah: 'Provinsi Rumah',
      no_hp: 'No. HP',
      email: 'Email',
      foto: 'Foto',
      status: 'Status',
    };

    return (
      <div className="space-y-1 text-sm">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium min-w-[120px]">{fieldLabels[key] || key}:</span>
            <span className="text-muted-foreground">{String(value || '-')}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usulan Perubahan Data</h1>
          <p className="text-muted-foreground">
            {isPusatAdmin ? 'Review dan setujui usulan perubahan dari Admin Cabang' : 'Daftar usulan perubahan yang Anda ajukan'}
          </p>
        </div>
        <Button onClick={fetchChangeRequests} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Usulan</CardTitle>
          <CardDescription>
            {isPusatAdmin 
              ? 'Terdapat usulan perubahan yang menunggu persetujuan Anda'
              : 'Status usulan perubahan yang telah Anda ajukan'
            }
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
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada usulan perubahan</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>NPA</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Perubahan</TableHead>
                    {isPusatAdmin && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
                      </TableCell>
                      <TableCell>{request.member?.nama || '-'}</TableCell>
                      <TableCell>{request.member?.npa || '-'}</TableCell>
                      <TableCell>{request.member?.cabang || '-'}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat Detail
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Detail Perubahan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Perubahan yang diajukan untuk {request.member?.nama}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              {renderChanges(request.changes)}
                            </div>
                            {request.rejection_reason && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm font-medium text-red-900">Alasan Penolakan:</p>
                                <p className="text-sm text-red-700 mt-1">{request.rejection_reason}</p>
                              </div>
                            )}
                            <AlertDialogFooter>
                              <AlertDialogCancel>Tutup</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                      {isPusatAdmin && (
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                                onClick={() => handleApprove(request.id, request.changes, request.member_id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Setujui
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Tolak
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tolak Usulan Perubahan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Berikan alasan penolakan untuk Admin Cabang
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-2">
                                    <Label htmlFor="rejection-reason">Alasan Penolakan</Label>
                                    <Textarea
                                      id="rejection-reason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Masukkan alasan penolakan..."
                                      rows={4}
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectionReason('')}>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleReject(request.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Tolak Usulan
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
