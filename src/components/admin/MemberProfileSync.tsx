import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberSyncContext } from '@/components/MemberSyncProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Member } from '@/types/member';

export function MemberProfileSync() {
  const { user } = useAuth();
  const { member, loading, syncStatus } = useMemberSyncContext();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({
    tgl_lahir: member?.tgl_lahir || '',
    tempat_lahir: member?.tempat_lahir || '',
    jenis_kelamin: member?.jenis_kelamin || undefined,
    no_hp: member?.no_hp || '',
    alamat_rumah: member?.alamat_rumah || '',
    kota_kabupaten_rumah: member?.kota_kabupaten_rumah || '',
    provinsi_rumah: member?.provinsi_rumah || '',
  });

  const handleInputChange = (field: keyof Member, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!member || !user) return;

    setIsUpdating(true);

    try {
      // Update member record
      const { error: memberError } = await supabase
        .from('members')
        .update(formData)
        .eq('id', member.id);

      if (memberError) {
        throw memberError;
      }

      // Update auth metadata to keep it in sync
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          tgl_lahir: formData.tgl_lahir,
          tempat_lahir: formData.tempat_lahir,
          jenis_kelamin: formData.jenis_kelamin,
          no_hp: formData.no_hp,
          alamat_rumah: formData.alamat_rumah,
        }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }

      toast({
        title: "Profil Diperbarui",
        description: "Data profil Anda telah berhasil diperbarui.",
      });

      // Refresh the page to get updated data
      window.location.reload();

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Sinkronisasi...
          </Badge>
        );
      case 'synced':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Tersinkronisasi
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Gagal Sinkronisasi
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Profil Anggota</CardTitle>
              <CardDescription>
                Kelola data profil yang tersinkronisasi dengan akun login Anda
              </CardDescription>
            </div>
          </div>
          {getSyncStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat data profil...</span>
          </div>
        )}

        {!loading && !member && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ditemukan data anggota dengan NIK Anda</p>
            <p className="text-sm mt-2">
              Pastikan NIK Anda terdaftar dalam database anggota PDPI.
            </p>
          </div>
        )}

        {!loading && member && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={member.nik || '-'}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  NIK tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                <Select
                  value={formData.jenis_kelamin}
                  onValueChange={(value) => handleInputChange('jenis_kelamin', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input
                  id="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={(e) => handleInputChange('tempat_lahir', e.target.value)}
                  placeholder="Masukkan tempat lahir"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tgl_lahir">Tanggal Lahir</Label>
                <Input
                  id="tgl_lahir"
                  type="date"
                  value={formData.tgl_lahir}
                  onChange={(e) => handleInputChange('tgl_lahir', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp">Nomor HP</Label>
                <Input
                  id="no_hp"
                  type="tel"
                  value={formData.no_hp}
                  onChange={(e) => handleInputChange('no_hp', e.target.value)}
                  placeholder="Masukkan nomor HP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provinsi_rumah">Provinsi Rumah</Label>
                <Input
                  id="provinsi_rumah"
                  value={formData.provinsi_rumah}
                  onChange={(e) => handleInputChange('provinsi_rumah', e.target.value)}
                  placeholder="Masukkan provinsi tempat tinggal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota_kabupaten_rumah">Kota/Kabupaten Rumah</Label>
              <Input
                id="kota_kabupaten_rumah"
                value={formData.kota_kabupaten_rumah}
                onChange={(e) => handleInputChange('kota_kabupaten_rumah', e.target.value)}
                placeholder="Masukkan kota/kabupaten tempat tinggal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat_rumah">Alamat Lengkap</Label>
              <Textarea
                id="alamat_rumah"
                value={formData.alamat_rumah}
                onChange={(e) => handleInputChange('alamat_rumah', e.target.value)}
                placeholder="Masukkan alamat lengkap tempat tinggal"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  'Perbarui Profil'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={isUpdating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
