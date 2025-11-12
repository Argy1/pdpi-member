import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ProfileFormData {
  nama: string;
  email?: string;
  no_hp?: string;
  alamat_rumah?: string;
  kota_kabupaten_rumah?: string;
  provinsi_rumah?: string;
  tempat_tugas?: string;
  kota_kabupaten_kantor?: string;
  provinsi_kantor?: string;
  tempat_praktek_1?: string;
  tempat_praktek_2?: string;
  tempat_praktek_3?: string;
}

export default function ProfilSayaPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMemberData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (response.error) throw response.error;

      if (response.data) {
        setMemberData(response.data);
        reset({
          nama: response.data.nama || '',
          email: response.data.email || '',
          no_hp: response.data.no_hp || '',
          alamat_rumah: response.data.alamat_rumah || '',
          kota_kabupaten_rumah: response.data.kota_kabupaten_rumah || '',
          provinsi_rumah: response.data.provinsi_rumah || '',
          tempat_tugas: response.data.tempat_tugas || '',
          kota_kabupaten_kantor: response.data.kota_kabupaten_kantor || '',
          provinsi_kantor: response.data.provinsi_kantor || '',
          tempat_praktek_1: response.data.tempat_praktek_1 || '',
          tempat_praktek_2: response.data.tempat_praktek_2 || '',
          tempat_praktek_3: response.data.tempat_praktek_3 || '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching member data:', err);
      toast({
        title: 'Error',
        description: err.message || 'Gagal memuat data profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('members')
        .update({
          nama: formData.nama,
          email: formData.email || null,
          no_hp: formData.no_hp || null,
          alamat_rumah: formData.alamat_rumah || null,
          kota_kabupaten_rumah: formData.kota_kabupaten_rumah || null,
          provinsi_rumah: formData.provinsi_rumah || null,
          tempat_tugas: formData.tempat_tugas || null,
          kota_kabupaten_kantor: formData.kota_kabupaten_kantor || null,
          provinsi_kantor: formData.provinsi_kantor || null,
          tempat_praktek_1: formData.tempat_praktek_1 || null,
          tempat_praktek_2: formData.tempat_praktek_2 || null,
          tempat_praktek_3: formData.tempat_praktek_3 || null,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });

      fetchMemberData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container-pdpi py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold heading-medical">Profil Saya</h1>
              <p className="text-muted-foreground mt-2">
                Kelola informasi pribadi dan data keanggotaan Anda
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !memberData ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Data profil tidak ditemukan. Silakan hubungi administrator.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informasi Pribadi */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Pribadi
                    </CardTitle>
                    <CardDescription>Data identitas dan keanggotaan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nik">NIK</Label>
                        <Input
                          id="nik"
                          value={memberData.nik || '-'}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Read-only</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="npa">NPA</Label>
                        <Input
                          id="npa"
                          value={memberData.npa || '-'}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Read-only</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        {...register('nama')}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.nama && (
                        <p className="text-sm text-destructive">{errors.nama.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Jenis Kelamin</Label>
                        <Input
                          value={memberData.jenis_kelamin || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cabang</Label>
                        <Input
                          value={memberData.cabang || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Kontak */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Informasi Kontak
                    </CardTitle>
                    <CardDescription>Email dan nomor telepon</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="email@example.com"
                          className="flex-1"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                      {!memberData.email && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data. Lengkapi sekarang.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_hp">No. HP/WhatsApp</Label>
                      <Input
                        id="no_hp"
                        {...register('no_hp')}
                        placeholder="08xxxxxxxxxx"
                      />
                      {!memberData.no_hp && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data. Lengkapi sekarang.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Alamat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Alamat Rumah
                    </CardTitle>
                    <CardDescription>Alamat tempat tinggal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alamat_rumah">Alamat Lengkap</Label>
                      <Textarea
                        id="alamat_rumah"
                        {...register('alamat_rumah')}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                        rows={3}
                      />
                      {!memberData.alamat_rumah && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data. Lengkapi sekarang.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="kota_kabupaten_rumah">Kota/Kabupaten</Label>
                        <Input
                          id="kota_kabupaten_rumah"
                          {...register('kota_kabupaten_rumah')}
                          placeholder="Kota/Kabupaten"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="provinsi_rumah">Provinsi</Label>
                        <Input
                          id="provinsi_rumah"
                          {...register('provinsi_rumah')}
                          placeholder="Provinsi"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tempat Kerja */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Tempat Kerja/Praktik
                    </CardTitle>
                    <CardDescription>Informasi tempat bekerja dan praktik</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempat_tugas">Tempat Tugas</Label>
                      <Input
                        id="tempat_tugas"
                        {...register('tempat_tugas')}
                        placeholder="Nama RS/Klinik/Instansi"
                      />
                      {!memberData.tempat_tugas && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data. Lengkapi sekarang.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="kota_kabupaten_kantor">Kota/Kabupaten Kantor</Label>
                        <Input
                          id="kota_kabupaten_kantor"
                          {...register('kota_kabupaten_kantor')}
                          placeholder="Kota/Kabupaten"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="provinsi_kantor">Provinsi Kantor</Label>
                        <Input
                          id="provinsi_kantor"
                          {...register('provinsi_kantor')}
                          placeholder="Provinsi"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_1">Tempat Praktik 1</Label>
                      <Input
                        id="tempat_praktek_1"
                        {...register('tempat_praktek_1')}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_2">Tempat Praktik 2</Label>
                      <Input
                        id="tempat_praktek_2"
                        {...register('tempat_praktek_2')}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_3">Tempat Praktik 3</Label>
                      <Input
                        id="tempat_praktek_3"
                        {...register('tempat_praktek_3')}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Dokumen Legal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Dokumen Legal
                    </CardTitle>
                    <CardDescription>STR, SIP, dan dokumen lainnya (read-only)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>No. STR</Label>
                        <Input
                          value={memberData.no_str || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>STR Berlaku Sampai</Label>
                        <Input
                          value={memberData.str_berlaku_sampai || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>No. SIP</Label>
                        <Input
                          value={memberData.no_sip || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SIP Berlaku Sampai</Label>
                        <Input
                          value={memberData.sip_berlaku_sampai || '-'}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Untuk memperbarui dokumen legal, silakan hubungi administrator cabang.
                    </p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
