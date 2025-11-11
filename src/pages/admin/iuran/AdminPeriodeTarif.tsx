import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPeriodeTarif() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dummy data
  const periods = [
    { id: 1, year: 2025, amount: 500000, dueDate: '31 Des 2025', status: 'active' },
    { id: 2, year: 2024, amount: 500000, dueDate: '31 Des 2024', status: 'completed' },
    { id: 3, year: 2023, amount: 450000, dueDate: '31 Des 2023', status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Periode & Tarif Iuran</h1>
          <p className="text-muted-foreground">Kelola periode pembayaran dan tarif iuran anggota</p>
        </div>
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <Input id="year" type="number" placeholder="2026" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal per Tahun</Label>
                <Input id="amount" type="number" placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Jatuh Tempo</Label>
                <Input id="dueDate" type="date" />
              </div>
              <Button className="w-full">Simpan Periode</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-semibold text-lg">{period.year}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      Rp {period.amount.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{period.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={period.status === 'active' ? 'default' : 'secondary'}>
                        {period.status === 'active' ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <li>• Perubahan tarif hanya berlaku untuk periode yang belum dimulai</li>
            <li>• Periode aktif tidak dapat dihapus jika sudah ada transaksi</li>
            <li>• Pastikan jatuh tempo diset minimal 1 bulan setelah periode dimulai</li>
            <li>• Notifikasi otomatis akan dikirim ke anggota saat periode baru dibuka</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
