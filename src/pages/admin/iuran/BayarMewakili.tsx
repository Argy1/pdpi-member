import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Calendar, CreditCard, Search, X, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { TARIFF_PER_YEAR, formatRupiah, generateGroupCode, calculateExpiry } from '@/utils/paymentHelpers';

interface SelectedMember {
  id: string;
  npa: string;
  nama: string;
  cabang: string;
  years: number[];
}

const STEPS = [
  { id: 1, title: 'Pilih Anggota', icon: Users },
  { id: 2, title: 'Pilih Tahun', icon: Calendar },
  { id: 3, title: 'Checkout', icon: CreditCard },
];

export default function BayarMewakili() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isAdminPusat, isAdminCabang, loading: profileLoading } = useAdminAccess();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [memberDues, setMemberDues] = useState<Record<string, any[]>>({});
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_transfer'>('qris');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!profileLoading && !isAdminPusat && !isAdminCabang) {
      navigate('/');
    }
  }, [profileLoading, isAdminPusat, isAdminCabang, navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      let query = supabase
        .from('members')
        .select('id, npa, nama, cabang')
        .or(`npa.ilike.%${searchQuery}%,nama.ilike.%${searchQuery}%`)
        .limit(10);

      // Filter by branch for admin_cabang
      if (isAdminCabang && profile?.branches?.name) {
        query = query.eq('cabang', profile.branches.name);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const addMember = async (member: any) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      toast({
        title: 'Info',
        description: 'Anggota sudah ditambahkan',
        variant: 'default',
      });
      return;
    }

    // Fetch member dues
    const { data: dues } = await supabase
      .from('member_dues')
      .select('*')
      .eq('member_id', member.id);

    setMemberDues(prev => ({ ...prev, [member.id]: dues || [] }));
    
    setSelectedMembers(prev => [...prev, {
      id: member.id,
      npa: member.npa,
      nama: member.nama,
      cabang: member.cabang,
      years: [],
    }]);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
    setMemberDues(prev => {
      const newDues = { ...prev };
      delete newDues[memberId];
      return newDues;
    });
  };

  const toggleYear = (memberId: string, year: number) => {
    setSelectedMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      
      const years = m.years.includes(year)
        ? m.years.filter(y => y !== year)
        : [...m.years, year];
      
      if (years.length > 5) {
        toast({
          title: 'Maksimal 5 tahun',
          description: 'Setiap anggota maksimal 5 tahun per transaksi',
          variant: 'destructive',
        });
        return m;
      }
      
      return { ...m, years };
    }));
  };

  const getAvailableYears = (memberId: string): number[] => {
    const dues = memberDues[memberId] || [];
    const paidYears = dues.filter(d => d.status === 'PAID').map(d => d.year);
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      if (!paidYears.includes(year)) {
        years.push(year);
      }
    }
    
    return years;
  };

  const calculateTotal = () => {
    const totalYears = selectedMembers.reduce((sum, m) => sum + m.years.length, 0);
    const amountBase = totalYears * TARIFF_PER_YEAR;
    const uniqueCode = paymentMethod === 'bank_transfer' 
      ? Math.floor(Math.random() * 900) + 100 
      : 0;
    return { amountBase, uniqueCode, total: amountBase + uniqueCode, totalYears };
  };

  const handleCreateInvoice = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: 'Error',
        description: 'Pilih minimal 1 anggota',
        variant: 'destructive',
      });
      return;
    }

    const hasEmptyYears = selectedMembers.some(m => m.years.length === 0);
    if (hasEmptyYears) {
      toast({
        title: 'Error',
        description: 'Semua anggota harus memiliki minimal 1 tahun',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate: Admin cabang can only pay for members in their PD
      if (isAdminCabang && profile?.branches?.name) {
        const invalidMembers = selectedMembers.filter(
          m => m.cabang !== profile.branches.name
        );
        if (invalidMembers.length > 0) {
          toast({
            title: 'Error',
            description: `Anggota berikut tidak berada di PD Anda: ${invalidMembers.map(m => m.nama).join(', ')}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      const { amountBase, uniqueCode, total } = calculateTotal();
      const groupCode = generateGroupCode();
      const expiredAt = calculateExpiry(paymentMethod);

      // Determine payer_role
      const payerRole = profile?.role || 'user';

      // Create payment group
      const { data: paymentGroup, error: groupError } = await supabase
        .from('payment_groups')
        .insert({
          group_code: groupCode,
          created_by: user.id,
          method: paymentMethod,
          amount_base: amountBase,
          unique_code: uniqueCode,
          total_payable: total,
          status: 'PENDING',
          expired_at: expiredAt.toISOString(),
          pd_scope: profile?.branch_id || null,
          paid_by_admin: true,
          payer_role: payerRole,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Create payment items
      const items = selectedMembers.flatMap(member =>
        member.years.map(year => ({
          payment_group_id: paymentGroup.id,
          member_id: member.id,
          npa: member.npa,
          year,
          amount: TARIFF_PER_YEAR,
          status: 'PENDING',
        }))
      );

      const { error: itemsError } = await supabase
        .from('payment_items')
        .insert(items);

      if (itemsError) throw itemsError;

      toast({
        title: 'Berhasil',
        description: 'Tagihan berhasil dibuat',
      });

      navigate(`/iuran/instruksi/${groupCode}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canProceedToStep2 = selectedMembers.length > 0;
  const canProceedToStep3 = selectedMembers.every(m => m.years.length > 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bayar Mewakili Anggota</h1>
          <p className="text-muted-foreground">Bayar iuran untuk anggota lain</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/iuran')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted text-muted-foreground'
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Members */}
      {currentStep === 1 && (
      <Card>
        <CardHeader>
          <CardTitle>Pilih Anggota</CardTitle>
          <CardDescription>
            Cari dan pilih anggota yang akan dibayarkan iurannya
            {isAdminCabang && profile?.branches?.name && (
              <span className="ml-2 text-primary">
                (PD: {profile.branches.name})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isAdminCabang 
                ? 'Hanya anggota di PD Anda yang dapat dipilih untuk pembayaran kolektif.'
                : 'Pilih anggota yang akan dibayarkan iurannya.'}
            </AlertDescription>
          </Alert>
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Cari NPA atau Nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                    onClick={() => addMember(member)}
                  >
                    <div>
                      <p className="font-medium">{member.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        NPA: {member.npa} • {member.cabang}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">Tambah</Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Members */}
            <div>
              <h3 className="font-medium mb-2">
                Anggota Terpilih ({selectedMembers.length})
              </h3>
              <div className="space-y-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="border rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{member.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        NPA: {member.npa} • {member.cabang}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
              >
                Lanjut
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Years */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Tahun Iuran</CardTitle>
            <CardDescription>
              Pilih tahun yang akan dibayar untuk setiap anggota (maksimal 5 tahun)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedMembers.map((member) => {
              const availableYears = getAvailableYears(member.id);
              return (
                <div key={member.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium">{member.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      NPA: {member.npa}
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableYears.slice(0, 10).map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${member.id}-${year}`}
                          checked={member.years.includes(year)}
                          onCheckedChange={() => toggleYear(member.id, year)}
                        />
                        <label
                          htmlFor={`${member.id}-${year}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {year}
                        </label>
                      </div>
                    ))}
                  </div>
                  {member.years.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {member.years.length} tahun dipilih •{' '}
                      {formatRupiah(member.years.length * TARIFF_PER_YEAR)}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep3}
              >
                Lanjut
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Checkout */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
            <CardDescription>Periksa detail dan pilih metode pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="border rounded-lg p-4 space-y-3">
              {selectedMembers.map((member) => (
                <div key={member.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{member.nama}</p>
                    <p className="text-muted-foreground">
                      {member.years.length} tahun: {member.years.join(', ')}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatRupiah(member.years.length * TARIFF_PER_YEAR)}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-medium mb-3">Metode Pembayaran</h3>
              <RadioGroup value={paymentMethod} onValueChange={(v: 'qris' | 'bank_transfer') => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="qris" id="qris" />
                  <Label htmlFor="qris" className="flex-1 cursor-pointer">
                    <p className="font-medium">QRIS</p>
                    <p className="text-sm text-muted-foreground">
                      Bayar langsung dengan scan QR (15 menit)
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <p className="font-medium">Transfer Bank Mega Syariah</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer dengan kode unik (24 jam)
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              {(() => {
                const { amountBase, uniqueCode, total, totalYears } = calculateTotal();
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalYears} tahun)</span>
                      <span>{formatRupiah(amountBase)}</span>
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <div className="flex justify-between text-sm">
                        <span>Kode Unik</span>
                        <span>{formatRupiah(uniqueCode)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatRupiah(total)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={handleCreateInvoice} disabled={loading}>
                {loading ? 'Memproses...' : 'Buat Tagihan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
