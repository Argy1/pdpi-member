import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Calendar, ShoppingCart, History, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { usePaymentCart } from '@/hooks/usePaymentCart';
import { usePaymentGroups } from '@/hooks/usePaymentGroups';
import { useMemberDues } from '@/hooks/useMemberDues';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TARIFF_PER_YEAR, MAX_YEARS_PER_TRANSACTION, formatRupiah, getAvailableYears } from '@/utils/paymentHelpers';
import { useToast } from '@/hooks/use-toast';

export default function IuranSaya() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedYears, setSelectedYears] = useState('1');
  const [myMember, setMyMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = usePaymentCart();
  const { paymentGroups } = usePaymentGroups();
  const { dues, isPaidYear } = useMemberDues(myMember?.id);

  const currentYear = new Date().getFullYear();

  // Redirect admins to admin iuran page
  useEffect(() => {
    if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
      navigate('/admin/iuran', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchMyMember = async () => {
      if (!user) return;
      
      // Don't fetch for admins
      if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
        setLoading(false);
        return;
      }
      
      try {
        // First try to find by email
        let { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        
        if (error) throw error;
        
        // If not found by email, try to find by NIK
        if (!data && profile?.nik) {
          const { data: nikData, error: nikError } = await supabase
            .from('members')
            .select('*')
            .eq('nik', profile.nik)
            .maybeSingle();
          
          if (nikError) throw nikError;
          data = nikData;
        }
        
        if (!data) {
          toast({
            title: 'Data Tidak Ditemukan',
            description: 'Data anggota Anda tidak ditemukan. Silakan hubungi admin untuk mendaftarkan data Anda.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        
        setMyMember(data);
      } catch (error: any) {
        console.error('Error fetching member:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data anggota: ' + error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyMember();
  }, [user, profile]);

  const currentPeriod = {
    year: currentYear,
    amount: TARIFF_PER_YEAR,
    status: isPaidYear(currentYear) ? 'paid' : 'unpaid',
    dueDate: `31 Desember ${currentYear}`
  };

  const recentHistory = paymentGroups
    .filter(g => g.status === 'PAID')
    .slice(0, 3)
    .map(g => ({
      id: g.id,
      period: new Date(g.created_at).getFullYear().toString(),
      amount: g.total_payable,
      status: 'paid',
      date: new Date(g.paid_at || g.created_at).toLocaleDateString('id-ID'),
      method: g.method === 'qris' ? 'QRIS' : 'Transfer'
    }));

  const handleAddToCart = () => {
    if (!myMember) {
      toast({
        title: 'Error',
        description: 'Data anggota tidak ditemukan',
        variant: 'destructive'
      });
      return;
    }

    const yearsCount = parseInt(selectedYears);
    const availableYears = getAvailableYears(dues.filter(d => d.status === 'PAID').map(d => d.year));
    const selectedYearsList = availableYears.slice(0, yearsCount);

    addItem({
      memberId: myMember.id,
      memberName: myMember.nama,
      npa: myMember.npa,
      years: selectedYearsList,
      cabang: myMember.cabang
    });

    toast({
      title: 'Berhasil',
      description: `${yearsCount} tahun ditambahkan ke keranjang`
    });

    navigate('/iuran/checkout');
  };

  // Early return for admins
  if (profile && (profile.role === 'admin_pusat' || profile.role === 'admin_cabang')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Iuran Saya</h1>
          </div>
          <p className="text-muted-foreground">Kelola pembayaran iuran anggota PDPI Anda</p>
        </div>

        {/* Current Period Status */}
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Status Iuran Periode {currentPeriod.year}</CardTitle>
                <CardDescription>Jatuh tempo: {currentPeriod.dueDate}</CardDescription>
              </div>
              <Badge variant={currentPeriod.status === 'paid' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                {currentPeriod.status === 'paid' ? (
                  <><CheckCircle className="h-4 w-4 mr-1" /> Lunas</>
                ) : (
                  <><AlertCircle className="h-4 w-4 mr-1" /> Belum Dibayar</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nominal per tahun</p>
                <p className="text-2xl font-bold text-primary">{formatRupiah(currentPeriod.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Bayar Iuran Baru
            </CardTitle>
            <CardDescription>Pilih periode pembayaran yang ingin Anda bayarkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Jumlah Tahun</label>
                <Select value={selectedYears} onValueChange={setSelectedYears}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jumlah tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Tahun</SelectItem>
                    <SelectItem value="2">2 Tahun</SelectItem>
                    <SelectItem value="3">3 Tahun</SelectItem>
                    <SelectItem value="4">4 Tahun</SelectItem>
                    <SelectItem value="5">5 Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Total Pembayaran</label>
                <div className="h-10 px-4 flex items-center rounded-md border bg-muted">
                  <span className="font-semibold text-primary">
                    {formatRupiah(TARIFF_PER_YEAR * parseInt(selectedYears))}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleAddToCart} size="lg" className="gap-2 w-full sm:w-auto">
                <ShoppingCart className="h-4 w-4" />
                Tambah ke Keranjang
              </Button>
              <Button variant="outline" onClick={() => navigate('/iuran/kolektif')} size="lg" className="w-full sm:w-auto">
                Pembayaran Kolektif
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Snapshot */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Riwayat Pembayaran Terakhir
                </CardTitle>
                <CardDescription>3 transaksi terakhir</CardDescription>
              </div>
              <Button variant="link" onClick={() => navigate('/iuran/riwayat')}>
                Lihat Semua →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentHistory.length > 0 ? (
                    recentHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.period}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.method}</TableCell>
                        <TableCell className="text-right">{formatRupiah(item.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Belum ada pembayaran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {recentHistory.length > 0 ? (
                recentHistory.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Periode {item.period}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lunas
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">{item.method}</span>
                        <span className="font-bold text-primary">{formatRupiah(item.amount)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada pembayaran
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
