import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePaymentCart, CartItem } from '@/hooks/usePaymentCart';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberDues } from '@/hooks/useMemberDues';
import { formatRupiah, TARIFF_PER_YEAR, MAX_YEARS_PER_TRANSACTION, getAvailableYears } from '@/utils/paymentHelpers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, Trash2, Loader2, Users } from 'lucide-react';

interface Member {
  id: string;
  npa: string;
  nama: string;
  cabang: string;
}

export default function PembayaranKolektif() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { items: cartItems, addItem, removeItem, getTotalAmount, clearCart } = usePaymentCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Map<string, { member: Member; years: number[] }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Redirect admins to admin iuran page
  useEffect(() => {
    if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
      navigate('/admin/iuran', { replace: true });
    }
  }, [profile, navigate]);

  // Search members from database
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Peringatan',
        description: 'Masukkan NPA atau nama anggota untuk mencari',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, npa, nama, cabang')
        .or(`npa.ilike.%${searchQuery}%,nama.ilike.%${searchQuery}%`)
        .eq('status', 'AKTIF')
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'Tidak Ditemukan',
          description: 'Anggota tidak ditemukan. Coba kata kunci lain.',
          variant: 'destructive'
        });
        setSearchResults([]);
        return;
      }

      setSearchResults(data);
    } catch (error: any) {
      console.error('Error searching members:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = (member: Member) => {
    if (selectedMembers.has(member.id)) {
      toast({
        title: 'Sudah Ditambahkan',
        description: `${member.nama} sudah ada dalam daftar`,
        variant: 'destructive'
      });
      return;
    }

    setSelectedMembers(new Map(selectedMembers.set(member.id, { 
      member, 
      years: [new Date().getFullYear()] 
    })));
    
    setSearchQuery('');
    setSearchResults([]);
    
    toast({
      title: 'Berhasil',
      description: `${member.nama} ditambahkan ke daftar pembayaran`
    });
  };

  const handleRemoveMember = (memberId: string) => {
    const newMap = new Map(selectedMembers);
    newMap.delete(memberId);
    setSelectedMembers(newMap);
  };

  const handleYearToggle = (memberId: string, year: number) => {
    const current = selectedMembers.get(memberId);
    if (!current) return;

    const yearIndex = current.years.indexOf(year);
    let newYears: number[];

    if (yearIndex >= 0) {
      // Remove year
      newYears = current.years.filter(y => y !== year);
    } else {
      // Add year
      if (current.years.length >= MAX_YEARS_PER_TRANSACTION) {
        toast({
          title: 'Batas Maksimal',
          description: `Maksimal ${MAX_YEARS_PER_TRANSACTION} tahun per anggota`,
          variant: 'destructive'
        });
        return;
      }
      newYears = [...current.years, year].sort();
    }

    if (newYears.length === 0) {
      toast({
        title: 'Peringatan',
        description: 'Minimal pilih 1 tahun',
        variant: 'destructive'
      });
      return;
    }

    setSelectedMembers(new Map(selectedMembers.set(memberId, {
      ...current,
      years: newYears
    })));
  };

  const calculateSubtotal = (years: number[]) => {
    return years.length * TARIFF_PER_YEAR;
  };

  const getTotalMembers = () => selectedMembers.size;
  const getTotalYears = () => {
    let total = 0;
    selectedMembers.forEach(({ years }) => {
      total += years.length;
    });
    return total;
  };

  const getGrandTotal = () => {
    let total = 0;
    selectedMembers.forEach(({ years }) => {
      total += calculateSubtotal(years);
    });
    return total;
  };

  const handleCheckout = () => {
    if (selectedMembers.size === 0) {
      toast({
        title: 'Keranjang Kosong',
        description: 'Tambahkan minimal 1 anggota untuk melanjutkan',
        variant: 'destructive'
      });
      return;
    }

    // Add all to cart
    clearCart();
    selectedMembers.forEach(({ member, years }) => {
      addItem({
        memberId: member.id,
        memberName: member.nama,
        npa: member.npa,
        years,
        cabang: member.cabang
      });
    });

    navigate('/iuran/checkout');
  };

  // Early return for admins
  if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pembayaran Kolektif</h1>
        <p className="text-muted-foreground">
          Bayar iuran untuk beberapa anggota sekaligus dalam satu transaksi
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cari Anggota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan NPA atau Nama anggota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg divide-y">
              {searchResults.map((member) => (
                <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">{member.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      NPA: {member.npa} • {member.cabang || 'Tidak ada cabang'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(member)}
                    disabled={selectedMembers.has(member.id)}
                  >
                    {selectedMembers.has(member.id) ? 'Sudah Ditambahkan' : 'Tambahkan'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Members Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Anggota ({getTotalMembers()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMembers.size === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada anggota yang ditambahkan</p>
              <p className="text-sm">Gunakan pencarian di atas untuk menambahkan anggota</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NPA</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(selectedMembers.values()).map(({ member, years }) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-mono">{member.npa}</TableCell>
                      <TableCell className="font-semibold">{member.nama}</TableCell>
                      <TableCell>{member.cabang || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {availableYears.slice(0, 5).map((year) => (
                            <div key={year} className="flex items-center gap-1">
                              <Checkbox
                                id={`${member.id}-${year}`}
                                checked={years.includes(year)}
                                onCheckedChange={() => handleYearToggle(member.id, year)}
                              />
                              <label
                                htmlFor={`${member.id}-${year}`}
                                className="text-sm cursor-pointer"
                              >
                                {year}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatRupiah(calculateSubtotal(years))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary & Checkout */}
      <Card className="sticky bottom-4 shadow-lg border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {getTotalMembers()} anggota • {getTotalYears()} tahun
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatRupiah(getGrandTotal())}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={selectedMembers.size === 0}
              className="gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Lanjut ke Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
