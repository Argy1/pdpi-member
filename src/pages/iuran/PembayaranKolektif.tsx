import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function PembayaranKolektif() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  // Dummy data
  const members = [
    { id: 1, npa: '12345', nama: 'Dr. Ahmad Suryadi, Sp.P', cabang: 'DKI Jakarta', years: 1, amount: 500000 },
    { id: 2, npa: '12346', nama: 'Dr. Budi Santoso, Sp.P', cabang: 'DKI Jakarta', years: 1, amount: 500000 },
    { id: 3, npa: '12347', nama: 'Dr. Citra Dewi, Sp.P', cabang: 'Jawa Barat', years: 2, amount: 1000000 }
  ];

  const handleAddMember = () => {
    // Logic untuk menambah anggota ke daftar
  };

  const handleRemoveMember = (id: number) => {
    // Logic untuk hapus anggota dari daftar
  };

  const handleCheckout = () => {
    navigate('/iuran/checkout');
  };

  const grandTotal = members.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Pembayaran Kolektif</h1>
          </div>
          <p className="text-muted-foreground">Bayarkan iuran untuk beberapa anggota sekaligus</p>
        </div>

        {/* Search Section */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Cari Anggota
            </CardTitle>
            <CardDescription>Cari berdasarkan NPA atau nama anggota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Masukkan NPA atau nama anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddMember} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Pembayaran</CardTitle>
                <CardDescription>{members.length} anggota dalam daftar</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {members.length} Anggota
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>NPA</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{member.npa}</TableCell>
                      <TableCell>{member.nama}</TableCell>
                      <TableCell>{member.cabang}</TableCell>
                      <TableCell>
                        <Select defaultValue={member.years.toString()}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Tahun</SelectItem>
                            <SelectItem value="2">2 Tahun</SelectItem>
                            <SelectItem value="3">3 Tahun</SelectItem>
                            <SelectItem value="4">4 Tahun</SelectItem>
                            <SelectItem value="5">5 Tahun</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        Rp {member.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary & Checkout */}
        <Card className="shadow-lg border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-primary">Rp {grandTotal.toLocaleString('id-ID')}</p>
              </div>
              <Button onClick={handleCheckout} size="lg" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Lanjut ke Checkout
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>• Semua pembayaran akan digabungkan dalam satu invoice</p>
              <p>• Anda dapat memilih metode pembayaran di halaman checkout</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
