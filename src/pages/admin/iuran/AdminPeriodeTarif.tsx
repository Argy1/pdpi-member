import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/utils/paymentHelpers';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminPeriodeTarif() {
  const { toast } = useToast();
  const { isAdminPusat, loading: authLoading } = useAdminAccess();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() + 1,
    tariff_per_year: 300000,
    due_date: ''
  });

  useEffect(() => {
    if (!authLoading) {
      fetchPeriods();
    }
  }, [authLoading]);

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setPeriods(data || []);
    } catch (error: any) {
      console.error('Error fetching periods:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdminPusat) {
      toast({
        title: 'Akses Ditolak',
        description: 'Hanya Admin Pusat yang dapat mengelola periode',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('periods')
        .insert({
          year: formData.year,
          tariff_per_year: formData.tariff_per_year,
          due_date: formData.due_date,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Periode baru berhasil ditambahkan'
      });

      setIsDialogOpen(false);
      fetchPeriods();
      setFormData({
        year: new Date().getFullYear() + 1,
        tariff_per_year: 300000,
        due_date: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Periode & Tarif Iuran</h1>
          <p className="text-muted-foreground">Kelola periode pembayaran dan tarif iuran anggota</p>
        </div>
        {isAdminPusat && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Periode
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Periode Baru</DialogTitle>
                <DialogDescription>Buat periode iuran baru dengan tarif yang ditentukan</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input 
                    id="year" 
                    type="number" 
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Nominal per Tahun</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={formData.tariff_per_year}
                    onChange={(e) => setFormData({ ...formData, tariff_per_year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Jatuh Tempo</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Simpan Periode</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Periods Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daftar Periode Iuran
          </CardTitle>
          <CardDescription>{periods.length} periode terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Nominal per Tahun</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-semibold text-lg">{period.year}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatRupiah(period.tariff_per_year)}
                    </TableCell>
                    <TableCell>
                      {period.due_date ? format(new Date(period.due_date), 'dd MMMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={period.status === 'active' ? 'default' : 'secondary'}>
                        {period.status === 'active' ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-md border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Catatan Penting</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Tarif standar untuk iuran anggota PDPI adalah Rp 300.000 per tahun</li>
            <li>• Periode digunakan sebagai metadata untuk pembayaran dan laporan</li>
            <li>• Jatuh tempo membantu sistem mengirim reminder otomatis</li>
            <li>• Hanya Admin Pusat yang dapat menambah atau mengubah periode</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
