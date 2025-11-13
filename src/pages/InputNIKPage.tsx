import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InputNIKPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNIKChange = (value: string) => {
    // Only allow numbers, max 16 digits
    const normalized = value.replace(/\D/g, '');
    if (normalized.length <= 16) {
      setNik(normalized);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (nik.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    setLoading(true);

    try {
      // Check if NIK exists in members table
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, nik, nama, npa')
        .eq('nik', nik)
        .maybeSingle();

      if (memberError) {
        throw memberError;
      }

      if (!memberData) {
        setError('NIK tidak terdaftar dalam database anggota PDPI. Silakan hubungi admin.');
        setLoading(false);
        return;
      }

      // Update user metadata with NIK
      const { error: authError } = await supabase.auth.updateUser({
        data: { nik }
      });

      if (authError) {
        throw authError;
      }

      // Update profiles table with NIK
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nik } as any)
        .eq('user_id', user?.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      toast({
        title: "NIK Berhasil Ditambahkan! ✓",
        description: `Akun Anda telah terhubung dengan data anggota: ${memberData.nama}`,
      });

      // Redirect to profile page
      setTimeout(() => {
        navigate('/profil-saya');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan NIK"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if NIK already exists
  const typedProfile = profile as any;
  const existingNik = typedProfile?.nik || user?.user_metadata?.nik;

  if (existingNik) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              NIK Sudah Terdaftar
            </CardTitle>
            <CardDescription>
              Akun Anda sudah terhubung dengan NIK: {existingNik}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/profil-saya')} className="w-full">
              Lihat Profil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Hubungkan NIK Anda</CardTitle>
          <CardDescription>
            Masukkan NIK Anda untuk menghubungkan akun dengan data anggota PDPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nik">
                NIK (Nomor Induk Kependudukan) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nik"
                type="text"
                value={nik}
                onChange={(e) => handleNIKChange(e.target.value)}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                disabled={loading}
                className="text-center text-lg tracking-wider"
              />
              <p className="text-xs text-muted-foreground">
                {nik.length}/16 digit
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Catatan:</strong> NIK Anda harus sudah terdaftar dalam database anggota PDPI. 
                Jika NIK belum terdaftar, silakan hubungi sekretariat PD Anda.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || nik.length !== 16}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Hubungkan NIK'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
