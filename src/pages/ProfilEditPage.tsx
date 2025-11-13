import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNIKSync } from '@/hooks/useNIKSync';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Mail, Phone, MapPin, Briefcase, FileText, 
  Save, X, Upload, Loader2, ArrowLeft, GraduationCap,
  Building2, AlertCircle
} from 'lucide-react';
import { Member } from '@/types/member';

export default function ProfilEditPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync NIK to profiles on mount
  useNIKSync();

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

      // Step 1: Get profile data with NIK from public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Type assertion for nik field
      const typedProfile = profileData as any;

      // Step 2: Get NIK from profile or user metadata
      const nik = typedProfile?.nik || user.user_metadata?.nik;
      
      if (!nik) {
        console.error('NIK not found in user metadata or profile');
        setLoading(false);
        return;
      }

      // Step 3: Sync NIK to profile if missing
      if (typedProfile && !typedProfile.nik && user.user_metadata?.nik) {
        await supabase
          .from('profiles')
          .update({ nik: user.user_metadata.nik } as any)
          .eq('user_id', user.id);
      }

      // Step 4: Find member record by NIK
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('nik', nik)
        .maybeSingle();

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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Format Tidak Didukung",
        description: "Hanya mendukung format JPG, JPEG, dan PNG"
      });
      return;
    }

    try {
      setUploading(true);

      // Use NPA for filename: <npa>.jpg
      const fileExt = file.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `${member.npa}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate HP (hanya angka dan plus)
    if (formData.no_hp && !/^[\d\+\-\s\(\)]+$/.test(formData.no_hp)) {
      newErrors.no_hp = 'Nomor HP hanya boleh berisi angka, +, -, spasi, dan tanda kurung';
    }

    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate tahun lulus (1900 - current year)
    const currentYear = new Date().getFullYear();
    if (formData.thn_lulus) {
      const year = Number(formData.thn_lulus);
      if (year < 1900 || year > currentYear) {
        newErrors.thn_lulus = `Tahun lulus harus antara 1900 - ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Mohon perbaiki kesalahan pada form"
      });
      return;
    }

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
        tempat_tugas: formData.tempat_tugas,
        jabatan: formData.jabatan,
        alumni: formData.alumni,
        thn_lulus: formData.thn_lulus,
        tempat_praktek_1: formData.tempat_praktek_1,
        tempat_praktek_1_tipe: formData.tempat_praktek_1_tipe,
        tempat_praktek_2: formData.tempat_praktek_2,
        tempat_praktek_2_tipe: formData.tempat_praktek_2_tipe,
        tempat_praktek_3: formData.tempat_praktek_3,
        tempat_praktek_3_tipe: formData.tempat_praktek_3_tipe,
        keterangan: formData.keterangan,
      };

      // Find member by NIK (since we don't have user_id column)
      const nik = user?.user_metadata?.nik;
      if (!nik) {
        throw new Error('NIK tidak ditemukan');
      }

      const { error } = await supabase
        .from('members')
        .update(allowedFields)
        .eq('nik', nik);

      if (error) throw error;

      toast({
        title: "Profil Berhasil Diperbarui ✓",
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
              Data anggota dengan NIK Anda belum tersedia di sistem. Silakan hubungi admin PDPI atau sekretariat PD Anda untuk pendaftaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Informasi Akun:</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-sm"><span className="font-medium">NIK:</span> {(user?.user_metadata?.nik) || (profile as any)?.nik || '-'}</p>
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
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Foto Profil
                </CardTitle>
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
                    <p className="text-xs text-muted-foreground mt-2">
                      File akan disimpan sebagai {member.npa}.jpg
                    </p>
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
                <FormField label="NPA" value={member.npa} readOnly required />
                <FormField label="NIK" value={member.nik} readOnly required />
                <FormField label="Nama Lengkap" value={member.nama} readOnly required className="md:col-span-2" />
                <FormField label="Jenis Kelamin" value={member.jenis_kelamin} readOnly />
                <FormField label="Tempat Lahir" value={member.tempat_lahir} readOnly />
                <FormField 
                  label="Tanggal Lahir" 
                  value={member.tgl_lahir ? new Date(member.tgl_lahir).toLocaleDateString('id-ID') : undefined} 
                  readOnly 
                />
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
                  <Label htmlFor="email">
                    Email {errors.email && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="email@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_hp">
                    No. HP {errors.no_hp && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="no_hp"
                    type="tel"
                    value={formData.no_hp || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, no_hp: e.target.value }));
                      setErrors(prev => ({ ...prev, no_hp: '' }));
                    }}
                    placeholder="08xxxxxxxxxx atau +62xxx"
                    className={errors.no_hp ? 'border-destructive' : ''}
                  />
                  {errors.no_hp && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.no_hp}
                    </p>
                  )}
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
                  <Label htmlFor="sosial_media">Media Sosial</Label>
                  <Input
                    id="sosial_media"
                    value={formData.sosial_media || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sosial_media: e.target.value }))}
                    placeholder="@username atau link profil"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Domisili / Alamat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Domisili / Alamat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alamat_rumah">Alamat Rumah</Label>
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

            {/* Profesi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Profesi
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempat_tugas">Tempat Tugas</Label>
                  <Input
                    id="tempat_tugas"
                    value={formData.tempat_tugas || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempat_tugas: e.target.value }))}
                    placeholder="RS/Klinik/Instansi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <Input
                    id="jabatan"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                    placeholder="Jabatan"
                  />
                </div>
                <FormField label="Cabang/PD" value={member.cabang} readOnly className="md:col-span-2" />
              </CardContent>
            </Card>

            {/* Pendidikan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Pendidikan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alumni">Alumni</Label>
                  <Input
                    id="alumni"
                    value={formData.alumni || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, alumni: e.target.value }))}
                    placeholder="Universitas/Institusi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thn_lulus">
                    Tahun Lulus {errors.thn_lulus && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="thn_lulus"
                    type="number"
                    value={formData.thn_lulus || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, thn_lulus: Number(e.target.value) }));
                      setErrors(prev => ({ ...prev, thn_lulus: '' }));
                    }}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    className={errors.thn_lulus ? 'border-destructive' : ''}
                  />
                  {errors.thn_lulus && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.thn_lulus}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tempat Praktik */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Tempat Praktik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Praktik 1 */}
                <div>
                  <h4 className="font-semibold mb-3">Praktik 1</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_1">Nama RS/Klinik</Label>
                      <Input
                        id="tempat_praktek_1"
                        value={formData.tempat_praktek_1 || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempat_praktek_1: e.target.value }))}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_1_tipe">Tipe RS</Label>
                      <Select
                        value={formData.tempat_praktek_1_tipe || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tempat_praktek_1_tipe: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                          <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                          <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                          <SelectItem value="RS Tipe D">RS Tipe D</SelectItem>
                          <SelectItem value="Klinik">Klinik</SelectItem>
                          <SelectItem value="Puskesmas">Puskesmas</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Praktik 2 */}
                <div>
                  <h4 className="font-semibold mb-3">Praktik 2 (Opsional)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_2">Nama RS/Klinik</Label>
                      <Input
                        id="tempat_praktek_2"
                        value={formData.tempat_praktek_2 || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempat_praktek_2: e.target.value }))}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_2_tipe">Tipe RS</Label>
                      <Select
                        value={formData.tempat_praktek_2_tipe || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tempat_praktek_2_tipe: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                          <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                          <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                          <SelectItem value="RS Tipe D">RS Tipe D</SelectItem>
                          <SelectItem value="Klinik">Klinik</SelectItem>
                          <SelectItem value="Puskesmas">Puskesmas</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Praktik 3 */}
                <div>
                  <h4 className="font-semibold mb-3">Praktik 3 (Opsional)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_3">Nama RS/Klinik</Label>
                      <Input
                        id="tempat_praktek_3"
                        value={formData.tempat_praktek_3 || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempat_praktek_3: e.target.value }))}
                        placeholder="Nama tempat praktik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempat_praktek_3_tipe">Tipe RS</Label>
                      <Select
                        value={formData.tempat_praktek_3_tipe || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tempat_praktek_3_tipe: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                          <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                          <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                          <SelectItem value="RS Tipe D">RS Tipe D</SelectItem>
                          <SelectItem value="Klinik">Klinik</SelectItem>
                          <SelectItem value="Puskesmas">Puskesmas</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dokumen Legal (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Dokumen Legal
                </CardTitle>
                <CardDescription>
                  Data dokumen legal tidak dapat diubah sendiri. Hubungi admin untuk perubahan.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField label="No. STR" value={member.no_str} readOnly />
                <FormField 
                  label="STR Berlaku Sampai" 
                  value={member.str_berlaku_sampai ? new Date(member.str_berlaku_sampai).toLocaleDateString('id-ID') : undefined} 
                  readOnly 
                />
                <FormField label="No. SIP" value={member.no_sip} readOnly />
                <FormField 
                  label="SIP Berlaku Sampai" 
                  value={member.sip_berlaku_sampai ? new Date(member.sip_berlaku_sampai).toLocaleDateString('id-ID') : undefined} 
                  readOnly 
                />
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
  required,
  className 
}: { 
  label: string; 
  value?: string | number | null;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input 
        value={value || '-'} 
        readOnly={readOnly}
        disabled={readOnly}
        className="bg-muted/50"
      />
    </div>
  );
}
