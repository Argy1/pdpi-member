import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Mail, Phone, MapPin, Briefcase, FileText, 
  Save, X, Upload, Loader2, ArrowLeft 
} from 'lucide-react';
import { Member } from '@/types/member';

export default function ProfilEditPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchMemberData();
    }
  }, [user, authLoading]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Step 1: Get profile data from public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Step 2: Get NIK from user metadata
      const nik = user.user_metadata?.nik;
      
      if (!nik) {
        console.error('NIK not found in user metadata or profile');
        setLoading(false);
        return;
      }

      // Step 3: Find member record with priority:
      // a) user_id = auth.uid()
      // b) nik = profiles.nik
      let memberData = null;
      
      // Try finding by NIK
      const { data: memberByNik } = await supabase
        .from('members')
        .select('*')
        .eq('nik', nik)
        .maybeSingle();


      memberData = memberByNik;

      // Step 5: Set member data and prefill form
      if (memberData) {
        setMember(memberData as Member);
        setFormData(memberData as Partial<Member>);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Terlalu Besar",
        description: "Ukuran foto maksimal 5MB"
      });
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${member.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto: publicUrl }));

      toast({
        title: "Foto Berhasil Diunggah",
        description: "Jangan lupa klik Simpan Perubahan"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Gagal Mengunggah Foto",
        description: error instanceof Error ? error.message : "Terjadi kesalahan"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    try {
      setSaving(true);

      // Only update allowed fields for regular users
      const allowedFields = {
        email: formData.email,
        no_hp: formData.no_hp,
        alamat_rumah: formData.alamat_rumah,
        kota_kabupaten_rumah: formData.kota_kabupaten_rumah,
        provinsi_rumah: formData.provinsi_rumah,
        sosial_media: formData.sosial_media,
        website: formData.website,
        foto: formData.foto,
        keterangan: formData.keterangan,
      };

      const { error } = await supabase
        .from('members')
        .update(allowedFields)
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "Profil Berhasil Diperbarui",
        description: "Data profil Anda telah tersimpan"
      });

      navigate('/profil');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Profil",
        description: error instanceof Error ? error.message : "Terjadi kesalahan"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-pdpi py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Data Anggota Belum Ditemukan</CardTitle>
            <CardDescription>
              Data anggota Anda belum tersedia di sistem. Silakan hubungi admin PDPI atau sekretariat PD Anda untuk pendaftaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Informasi Akun:</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-sm"><span className="font-medium">NIK:</span> {user?.user_metadata?.nik || '-'}</p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container-pdpi py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold heading-medical">Edit Profil</h1>
              <p className="text-muted-foreground mt-1">
                Perbarui informasi profil Anda
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/profil')}
            >
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Profil */}
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
                <CardDescription>
                  Upload foto profil Anda (maksimal 5MB, format JPG/PNG)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.foto || undefined} alt={member.nama} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(member.nama)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Label htmlFor="photo">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById('photo')?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengunggah...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Foto
                          </>
                        )}
                      </Button>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identitas (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Identitas
                </CardTitle>
                <CardDescription>
                  Data identitas tidak dapat diubah sendiri. Hubungi admin untuk perubahan.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField label="NIK" value={member.nik} readOnly />
                <FormField label="NPA" value={member.npa} readOnly />
                <FormField label="Nama Lengkap" value={member.nama} readOnly className="md:col-span-2" />
                <FormField label="Jenis Kelamin" value={member.jenis_kelamin} readOnly />
                <FormField label="Tempat Lahir" value={member.tempat_lahir} readOnly />
                <FormField 
                  label="Tanggal Lahir" 
                  value={member.tgl_lahir ? new Date(member.tgl_lahir).toLocaleDateString('id-ID') : undefined} 
                  readOnly 
                />
                <FormField label="Alumni" value={member.alumni} readOnly />
                <FormField label="Tahun Lulus" value={member.thn_lulus} readOnly />
              </CardContent>
            </Card>

            {/* Kontak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_hp">No. HP</Label>
                  <Input
                    id="no_hp"
                    type="tel"
                    value={formData.no_hp || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sosial_media">Sosial Media</Label>
                  <Input
                    id="sosial_media"
                    value={formData.sosial_media || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sosial_media: e.target.value }))}
                    placeholder="@username"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Alamat Domisili */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Alamat Domisili
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alamat_rumah">Alamat Lengkap</Label>
                  <Textarea
                    id="alamat_rumah"
                    value={formData.alamat_rumah || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, alamat_rumah: e.target.value }))}
                    placeholder="Jalan, nomor rumah, RT/RW, kelurahan"
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kota_kabupaten_rumah">Kota/Kabupaten</Label>
                    <Input
                      id="kota_kabupaten_rumah"
                      value={formData.kota_kabupaten_rumah || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, kota_kabupaten_rumah: e.target.value }))}
                      placeholder="Kota/Kabupaten"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provinsi_rumah">Provinsi</Label>
                    <Input
                      id="provinsi_rumah"
                      value={formData.provinsi_rumah || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, provinsi_rumah: e.target.value }))}
                      placeholder="Provinsi"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profesi (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Profesi
                </CardTitle>
                <CardDescription>
                  Data profesi tidak dapat diubah sendiri. Hubungi admin untuk perubahan.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField label="Tempat Tugas" value={member.tempat_tugas} readOnly />
                <FormField label="Jabatan" value={member.jabatan} readOnly />
              </CardContent>
            </Card>

            {/* Keterangan */}
            <Card>
              <CardHeader>
                <CardTitle>Keterangan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Tambahkan catatan atau informasi tambahan..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/profil')}
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({ 
  label, 
  value, 
  readOnly,
  className 
}: { 
  label: string; 
  value?: string | number | null;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label>{label}</Label>
      <Input 
        value={value || '-'} 
        readOnly={readOnly}
        disabled={readOnly}
        className="bg-muted/50"
      />
    </div>
  );
}
