import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, ArrowLeft, Save, X, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMemberContext } from '@/contexts/MemberContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExcelImport } from '@/components/admin/ExcelImport';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MemberFormData {
  // Identitas
  nama: string;
  gelar: string;
  gelar2: string;
  npa: string;
  spesialis: string;
  subspesialis: string;
  tempatLahir: string;
  tanggalLahir: Date | undefined;
  jenisKelamin: string;
  foto: string;
  alumni: string;
  
  // Domisili
  alamat: string;
  kotaKantor: string;
  provinsiKantor: string;
  kotaRumah: string;
  provinsiRumah: string;
  pd: string;
  
  // Profesi
  unitKerja: string;
  jabatan: string;
  tempatPraktek1: string;
  tempatPraktek1Tipe: string;
  tempatPraktek2: string;
  tempatPraktek2Tipe: string;
  tempatPraktek3: string;
  tempatPraktek3Tipe: string;
  
  // Legal
  nik: string;
  noSTR: string;
  strBerlakuSampai: Date | undefined;
  noSIP: string;
  sipBerlakuSampai: Date | undefined;
  tahunLulus: string;
  
  // Kontak
  kontakEmail: string;
  kontakTelepon: string;
  
  // Media
  website: string;
  sosialMedia: string;
  
  // Status
  status: string;
}

const initialFormData: MemberFormData = {
  nama: '',
  gelar: '',
  gelar2: '',
  npa: '',
  spesialis: '',
  subspesialis: '',
  tempatLahir: '',
  tanggalLahir: undefined,
  jenisKelamin: '',
  foto: '',
  alumni: '',
  alamat: '',
  kotaKantor: '',
  provinsiKantor: '',
  kotaRumah: '',
  provinsiRumah: '',
  pd: '',
  unitKerja: '',
  jabatan: '',
  tempatPraktek1: '',
  tempatPraktek1Tipe: '',
  tempatPraktek2: '',
  tempatPraktek2Tipe: '',
  tempatPraktek3: '',
  tempatPraktek3Tipe: '',
  nik: '',
  noSTR: '',
  strBerlakuSampai: undefined,
  noSIP: '',
  sipBerlakuSampai: undefined,
  tahunLulus: '',
  kontakEmail: '',
  kontakTelepon: '',
  website: '',
  sosialMedia: '',
  status: 'Biasa',
};

export default function AdminMemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { members, addMember, updateMember } = useMemberContext();
  const { isPusatAdmin, isCabangAdmin, user } = useAuth();
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const isEditing = Boolean(id && id !== 'new');
  const pageTitle = isEditing ? 'Edit Anggota' : 'Tambah Anggota Baru';
  
  // Field protections based on role
  const isNPADisabled = isCabangAdmin;
  const isCabangDisabled = isCabangAdmin;

  useEffect(() => {
    const fetchMemberForEdit = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          
          // Fetch member directly from database to ensure we have latest data
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching member for edit:', error);
            toast({
              title: 'Error',
              description: 'Gagal memuat data anggota untuk diedit.',
              variant: 'destructive',
            });
            return;
          }
          
          if (!data) {
            toast({
              title: 'Error',
              description: 'Data anggota tidak ditemukan.',
              variant: 'destructive',
            });
            navigate('/admin/anggota');
            return;
          }

          const existingMember = data;
          const memberFormData = {
            nama: existingMember.nama || '',
            gelar: existingMember.gelar || '',
            gelar2: existingMember.gelar2 || '',
            npa: existingMember.npa || '',
            spesialis: '', // Field doesn't exist in database, set to empty
            subspesialis: '', // Field doesn't exist in database, set to empty
            tempatLahir: existingMember.tempat_lahir || '',
            tanggalLahir: existingMember.tgl_lahir ? new Date(existingMember.tgl_lahir) : undefined,
            jenisKelamin: existingMember.jenis_kelamin === 'L' ? 'Laki-laki' : 
                         existingMember.jenis_kelamin === 'P' ? 'Perempuan' : '',
            foto: existingMember.foto || '',
            alumni: existingMember.alumni || '',
            alamat: existingMember.alamat_rumah || '',
            kotaKantor: existingMember.kota_kabupaten_kantor || '',
            provinsiKantor: existingMember.provinsi_kantor || '',
            kotaRumah: existingMember.kota_kabupaten_rumah || '',
            provinsiRumah: existingMember.provinsi_rumah || '',
            pd: existingMember.cabang || '',
            unitKerja: existingMember.tempat_tugas || '', // Map tempat_tugas to unitKerja
            jabatan: '', // Field doesn't exist in database, set to empty
            tempatPraktek1: existingMember.tempat_praktek_1 || '',
            tempatPraktek1Tipe: existingMember.tempat_praktek_1_tipe || '',
            tempatPraktek2: existingMember.tempat_praktek_2 || '',
            tempatPraktek2Tipe: existingMember.tempat_praktek_2_tipe || '',
            tempatPraktek3: existingMember.tempat_praktek_3 || '',
            tempatPraktek3Tipe: existingMember.tempat_praktek_3_tipe || '',
            nik: '', // Field doesn't exist in database, set to empty
            noSTR: '', // Field doesn't exist in database, set to empty
            strBerlakuSampai: undefined, // Field doesn't exist in database, set to undefined
            noSIP: '', // Field doesn't exist in database, set to empty
            sipBerlakuSampai: undefined, // Field doesn't exist in database, set to undefined
            tahunLulus: existingMember.thn_lulus?.toString() || '',
            kontakEmail: existingMember.email || '',
            kontakTelepon: existingMember.no_hp || '',
            website: '', // Field doesn't exist in database, set to empty
            sosialMedia: '', // Field doesn't exist in database, set to empty
            status: existingMember.status || 'Biasa',
          };
          setFormData(memberFormData);
          setPhotoPreview(existingMember.foto || '');
          
        } catch (error) {
          console.error('Error in fetchMemberForEdit:', error);
          toast({
            title: 'Error',
            description: 'Terjadi kesalahan saat memuat data anggota.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMemberForEdit();
  }, [id, isEditing, navigate, toast]);

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('member-photos')
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        // Set preview and form data
        setPhotoPreview(publicUrl);
        handleInputChange('foto', publicUrl);

        toast({
          title: 'Foto berhasil diupload',
          description: 'Foto anggota telah diupload ke server.',
        });
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: 'Error upload foto',
          description: 'Gagal mengupload foto. Silakan coba lagi.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.nama.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'Nama lengkap wajib diisi.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.npa.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'NPA (Nomor Peserta Anggota) wajib diisi.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      
      const memberData = {
        nama: formData.nama,
        gelar: formData.gelar || null,
        gelar2: formData.gelar2 || null,
        npa: formData.npa || null,
        alumni: formData.alumni || null,
        // Map form fields to database fields
        tgl_lahir: formData.tanggalLahir ? formData.tanggalLahir.toISOString().split('T')[0] : null,
        tempat_lahir: formData.tempatLahir || null,
        jenis_kelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' as const : formData.jenisKelamin === 'Perempuan' ? 'P' as const : null,
        thn_lulus: formData.tahunLulus ? parseInt(formData.tahunLulus.toString()) : null,
        tempat_tugas: formData.unitKerja || null, // Save unitKerja as tempat_tugas
        kota_kabupaten_kantor: formData.kotaKantor || null,
        provinsi_kantor: formData.provinsiKantor || null,
        alamat_rumah: formData.alamat || null,
        kota_kabupaten_rumah: formData.kotaRumah || null,
        provinsi_rumah: formData.provinsiRumah || null,
        no_hp: formData.kontakTelepon || null,
        email: formData.kontakEmail || null,
        foto: formData.foto || null,
        status: formData.status || 'Biasa',
        cabang: formData.pd || null,
        tempat_praktek_1: formData.tempatPraktek1 || null,
        tempat_praktek_1_tipe: formData.tempatPraktek1Tipe || null,
        tempat_praktek_2: formData.tempatPraktek2 || null,
        tempat_praktek_2_tipe: formData.tempatPraktek2Tipe || null,
        tempat_praktek_3: formData.tempatPraktek3 || null,
        tempat_praktek_3_tipe: formData.tempatPraktek3Tipe || null,
        keterangan: null // Can be added later if needed
      }

      console.log('Mapped member data:', memberData);
      
      if (isEditing && id) {
        // Admin Cabang: Create change request instead of direct update
        if (isCabangAdmin && !isPusatAdmin) {
          const { error } = await supabase
            .from('member_change_requests')
            .insert({
              member_id: id,
              requested_by: user?.id,
              changes: memberData,
              status: 'pending',
            });

          if (error) {
            console.error('Supabase change request error:', error);
            throw new Error(`Database error: ${error.message}`);
          }

          toast({
            title: 'Usulan Perubahan Dikirim',
            description: 'Perubahan data akan diterapkan setelah disetujui Super Admin.',
          });
          
          navigate('/admin/anggota');
          return;
        }

        // Super Admin: Direct update
        const { data, error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log('Update successful:', data);
      } else {
        // Direct Supabase insert for new members
        const { data, error } = await supabase
          .from('members')
          .insert([memberData])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log('Insert successful:', data);
      }
      
      toast({
        title: isEditing ? 'Data anggota diperbarui' : 'Anggota baru ditambahkan',
        description: `Data ${formData.nama} berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`,
      });
      
      navigate('/admin/anggota');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan data anggota.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/anggota">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Edit informasi anggota' : 'Tambahkan anggota baru ke sistem'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link to="/admin/anggota">
              <X className="h-4 w-4 mr-2" />
              Batal
            </Link>
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      {/* Show loading state when fetching data for edit */}
      {isEditing && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data anggota...</p>
          </div>
        </div>
      )}

      {/* Show form only when not loading or when adding new member */}
      {(!isEditing || !loading) && (
        <>
          {!isEditing && (
            <div className="mb-6">
              <ExcelImport />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="identitas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="identitas">Identitas</TabsTrigger>
            <TabsTrigger value="domisili">Domisili</TabsTrigger>
            <TabsTrigger value="profesi">Profesi</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="kontak">Kontak</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* Identitas Tab */}
          <TabsContent value="identitas">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Identitas</CardTitle>
                <CardDescription>
                  Data pribadi dan identitas profesional anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => handleInputChange('nama', e.target.value)}
                        placeholder="Dr. Nama Lengkap"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gelar">Gelar 1</Label>
                      <Input
                        id="gelar"
                        value={formData.gelar}
                        onChange={(e) => handleInputChange('gelar', e.target.value)}
                        placeholder="Sp.P, M.Kes, dll"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gelar2">Gelar 2</Label>
                      <Input
                        id="gelar2"
                        value={formData.gelar2}
                        onChange={(e) => handleInputChange('gelar2', e.target.value)}
                        placeholder="Ph.D, Dr., dll"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="npa" className="flex items-center gap-2">
                        Nomor Peserta Anggota (NPA) *
                        {isNPADisabled && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </Label>
                      <Input
                        id="npa"
                        value={formData.npa}
                        onChange={(e) => handleInputChange('npa', e.target.value)}
                        placeholder="NPA123456"
                        required
                        disabled={isNPADisabled}
                        className={cn(isNPADisabled && "bg-muted cursor-not-allowed")}
                      />
                      {isNPADisabled && (
                        <p className="text-xs text-muted-foreground">
                          Field ini hanya dapat diedit oleh Super Admin
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spesialis">Spesialis *</Label>
                      <Select 
                        value={formData.spesialis} 
                        onValueChange={(value) => handleInputChange('spesialis', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih spesialis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pulmonologi">Pulmonologi</SelectItem>
                          <SelectItem value="Kedokteran Paru">Kedokteran Paru</SelectItem>
                          <SelectItem value="Respirologi">Respirologi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subspesialis">Sub Spesialis</Label>
                      <Input
                        id="subspesialis"
                        value={formData.subspesialis}
                        onChange={(e) => handleInputChange('subspesialis', e.target.value)}
                        placeholder="Sub spesialis (opsional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alumni">Alumni</Label>
                      <Input
                        id="alumni"
                        value={formData.alumni}
                        onChange={(e) => handleInputChange('alumni', e.target.value)}
                        placeholder="Universitas/Kampus asal"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Foto Profil</Label>
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={photoPreview || formData.foto} />
                          <AvatarFallback className="text-2xl">
                            {formData.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'UN'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Foto
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                        <Input
                          id="tempatLahir"
                          value={formData.tempatLahir}
                          onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                          placeholder="Jakarta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.tanggalLahir && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggalLahir ? (
                                format(formData.tanggalLahir, "dd MMMM yyyy")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <EnhancedCalendar
                              mode="single"
                              selected={formData.tanggalLahir}
                              onSelect={(date) => handleInputChange('tanggalLahir', date)}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              enableYearMonthSelect={true}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                      <Select 
                        value={formData.jenisKelamin} 
                        onValueChange={(value) => handleInputChange('jenisKelamin', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domisili Tab */}
          <TabsContent value="domisili">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Domisili</CardTitle>
                <CardDescription>
                  Alamat dan informasi geografis anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alamat">Alamat Lengkap</Label>
                      <Textarea
                        id="alamat"
                        value={formData.alamat}
                        onChange={(e) => handleInputChange('alamat', e.target.value)}
                        placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan, Kecamatan"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kotaKantor">Kota/Kabupaten Kantor</Label>
                      <Input
                        id="kotaKantor"
                        value={formData.kotaKantor}
                        onChange={(e) => handleInputChange('kotaKantor', e.target.value)}
                        placeholder="Jakarta"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kotaRumah">Kota/Kabupaten Rumah</Label>
                      <Input
                        id="kotaRumah"
                        value={formData.kotaRumah}
                        onChange={(e) => handleInputChange('kotaRumah', e.target.value)}
                        placeholder="Bandung"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="provinsiKantor">Provinsi Kantor</Label>
                      <Select 
                        value={formData.provinsiKantor} 
                        onValueChange={(value) => handleInputChange('provinsiKantor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aceh">Aceh</SelectItem>
                          <SelectItem value="Sumatera Utara">Sumatera Utara</SelectItem>
                          <SelectItem value="Sumatera Barat">Sumatera Barat</SelectItem>
                          <SelectItem value="Riau">Riau</SelectItem>
                          <SelectItem value="Kepulauan Riau">Kepulauan Riau</SelectItem>
                          <SelectItem value="Jambi">Jambi</SelectItem>
                          <SelectItem value="Sumatera Selatan">Sumatera Selatan</SelectItem>
                          <SelectItem value="Kepulauan Bangka Belitung">Kepulauan Bangka Belitung</SelectItem>
                          <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          <SelectItem value="Lampung">Lampung</SelectItem>
                          <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                          <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                          <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                          <SelectItem value="DI Yogyakarta">DI Yogyakarta</SelectItem>
                          <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                          <SelectItem value="Banten">Banten</SelectItem>
                          <SelectItem value="Bali">Bali</SelectItem>
                          <SelectItem value="Nusa Tenggara Barat (NTB)">Nusa Tenggara Barat (NTB)</SelectItem>
                          <SelectItem value="Nusa Tenggara Timur (NTT)">Nusa Tenggara Timur (NTT)</SelectItem>
                          <SelectItem value="Kalimantan Barat">Kalimantan Barat</SelectItem>
                          <SelectItem value="Kalimantan Tengah">Kalimantan Tengah</SelectItem>
                          <SelectItem value="Kalimantan Selatan">Kalimantan Selatan</SelectItem>
                          <SelectItem value="Kalimantan Timur">Kalimantan Timur</SelectItem>
                          <SelectItem value="Kalimantan Utara">Kalimantan Utara</SelectItem>
                          <SelectItem value="Sulawesi Utara">Sulawesi Utara</SelectItem>
                          <SelectItem value="Gorontalo">Gorontalo</SelectItem>
                          <SelectItem value="Sulawesi Tengah">Sulawesi Tengah</SelectItem>
                          <SelectItem value="Sulawesi Barat">Sulawesi Barat</SelectItem>
                          <SelectItem value="Sulawesi Selatan">Sulawesi Selatan</SelectItem>
                          <SelectItem value="Sulawesi Tenggara">Sulawesi Tenggara</SelectItem>
                          <SelectItem value="Maluku">Maluku</SelectItem>
                          <SelectItem value="Maluku Utara">Maluku Utara</SelectItem>
                          <SelectItem value="Papua">Papua</SelectItem>
                          <SelectItem value="Papua Barat">Papua Barat</SelectItem>
                          <SelectItem value="Papua Selatan">Papua Selatan</SelectItem>
                          <SelectItem value="Papua Tengah">Papua Tengah</SelectItem>
                          <SelectItem value="Papua Pegunungan">Papua Pegunungan</SelectItem>
                          <SelectItem value="Papua Barat Daya">Papua Barat Daya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provinsiRumah">Provinsi Rumah</Label>
                      <Select 
                        value={formData.provinsiRumah} 
                        onValueChange={(value) => handleInputChange('provinsiRumah', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih provinsi rumah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aceh">Aceh</SelectItem>
                          <SelectItem value="Sumatera Utara">Sumatera Utara</SelectItem>
                          <SelectItem value="Sumatera Barat">Sumatera Barat</SelectItem>
                          <SelectItem value="Riau">Riau</SelectItem>
                          <SelectItem value="Kepulauan Riau">Kepulauan Riau</SelectItem>
                          <SelectItem value="Jambi">Jambi</SelectItem>
                          <SelectItem value="Sumatera Selatan">Sumatera Selatan</SelectItem>
                          <SelectItem value="Kepulauan Bangka Belitung">Kepulauan Bangka Belitung</SelectItem>
                          <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          <SelectItem value="Lampung">Lampung</SelectItem>
                          <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                          <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                          <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                          <SelectItem value="DI Yogyakarta">DI Yogyakarta</SelectItem>
                          <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                          <SelectItem value="Banten">Banten</SelectItem>
                          <SelectItem value="Bali">Bali</SelectItem>
                          <SelectItem value="Nusa Tenggara Barat (NTB)">Nusa Tenggara Barat (NTB)</SelectItem>
                          <SelectItem value="Nusa Tenggara Timur (NTT)">Nusa Tenggara Timur (NTT)</SelectItem>
                          <SelectItem value="Kalimantan Barat">Kalimantan Barat</SelectItem>
                          <SelectItem value="Kalimantan Tengah">Kalimantan Tengah</SelectItem>
                          <SelectItem value="Kalimantan Selatan">Kalimantan Selatan</SelectItem>
                          <SelectItem value="Kalimantan Timur">Kalimantan Timur</SelectItem>
                          <SelectItem value="Kalimantan Utara">Kalimantan Utara</SelectItem>
                          <SelectItem value="Sulawesi Utara">Sulawesi Utara</SelectItem>
                          <SelectItem value="Gorontalo">Gorontalo</SelectItem>
                          <SelectItem value="Sulawesi Tengah">Sulawesi Tengah</SelectItem>
                          <SelectItem value="Sulawesi Barat">Sulawesi Barat</SelectItem>
                          <SelectItem value="Sulawesi Selatan">Sulawesi Selatan</SelectItem>
                          <SelectItem value="Sulawesi Tenggara">Sulawesi Tenggara</SelectItem>
                          <SelectItem value="Maluku">Maluku</SelectItem>
                          <SelectItem value="Maluku Utara">Maluku Utara</SelectItem>
                          <SelectItem value="Papua">Papua</SelectItem>
                          <SelectItem value="Papua Barat">Papua Barat</SelectItem>
                          <SelectItem value="Papua Selatan">Papua Selatan</SelectItem>
                          <SelectItem value="Papua Tengah">Papua Tengah</SelectItem>
                          <SelectItem value="Papua Pegunungan">Papua Pegunungan</SelectItem>
                          <SelectItem value="Papua Barat Daya">Papua Barat Daya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pd" className="flex items-center gap-2">
                        Cabang/Wilayah
                        {isCabangDisabled && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </Label>
                      <Select 
                        value={formData.pd} 
                        onValueChange={(value) => handleInputChange('pd', value)}
                        disabled={isCabangDisabled}
                      >
                        <SelectTrigger className={cn(isCabangDisabled && "bg-muted cursor-not-allowed")}>
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cabang Aceh">Cabang Aceh</SelectItem>
                          <SelectItem value="Cabang Sumatera Utara">Cabang Sumatera Utara</SelectItem>
                          <SelectItem value="Cabang Sumatera Barat">Cabang Sumatera Barat</SelectItem>
                          <SelectItem value="Cabang Riau">Cabang Riau</SelectItem>
                          <SelectItem value="Cabang Kep. Riau">Cabang Kep. Riau</SelectItem>
                          <SelectItem value="Cabang Jambi">Cabang Jambi</SelectItem>
                          <SelectItem value="Cabang Sum Sel & Bangka Belitung">Cabang Sum Sel & Bangka Belitung</SelectItem>
                          <SelectItem value="Cabang Lampung">Cabang Lampung</SelectItem>
                          <SelectItem value="Cabang Banten">Cabang Banten</SelectItem>
                          <SelectItem value="Cabang Jakarta">Cabang Jakarta</SelectItem>
                          <SelectItem value="Cabang Bogor">Cabang Bogor</SelectItem>
                          <SelectItem value="Cabang Depok">Cabang Depok</SelectItem>
                          <SelectItem value="Cabang Bekasi">Cabang Bekasi</SelectItem>
                          <SelectItem value="Cabang Jawa Barat">Cabang Jawa Barat</SelectItem>
                          <SelectItem value="Cabang Jawa Tengah">Cabang Jawa Tengah</SelectItem>
                          <SelectItem value="Cabang Surakarta">Cabang Surakarta</SelectItem>
                          <SelectItem value="Cabang Yogyakarta">Cabang Yogyakarta</SelectItem>
                          <SelectItem value="Cabang Jawa Timur">Cabang Jawa Timur</SelectItem>
                          <SelectItem value="Cabang Malang">Cabang Malang</SelectItem>
                          <SelectItem value="Cabang Bali">Cabang Bali</SelectItem>
                          <SelectItem value="Cabang Nusa Tenggara Barat">Cabang Nusa Tenggara Barat</SelectItem>
                          <SelectItem value="Cabang Nusa Tenggara Timur">Cabang Nusa Tenggara Timur</SelectItem>
                          <SelectItem value="Cabang Kalimantan Selatan">Cabang Kalimantan Selatan</SelectItem>
                          <SelectItem value="Cabang Kalimantan Timur">Cabang Kalimantan Timur</SelectItem>
                          <SelectItem value="Cabang Kalimantan Barat">Cabang Kalimantan Barat</SelectItem>
                          <SelectItem value="Cabang Kalimantan Tengah">Cabang Kalimantan Tengah</SelectItem>
                          <SelectItem value="Cabang Sulawesi">Cabang Sulawesi</SelectItem>
                          <SelectItem value="Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)">Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)</SelectItem>
                          <SelectItem value="Cabang Sulselbarra">Cabang Sulselbarra</SelectItem>
                          <SelectItem value="Cabang Maluku Utara & Maluku">Cabang Maluku Utara & Maluku</SelectItem>
                          <SelectItem value="Cabang Maluku Selatan dan Utara">Cabang Maluku Selatan dan Utara</SelectItem>
                          <SelectItem value="Cabang Papua">Cabang Papua</SelectItem>
                        </SelectContent>
                      </Select>
                      {isCabangDisabled && (
                        <p className="text-xs text-muted-foreground">
                          Field ini hanya dapat diedit oleh Super Admin
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Continue with other tabs... */}
          {/* For brevity, I'll create simplified versions of the remaining tabs */}
          
          <TabsContent value="profesi">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profesi</CardTitle>
                <CardDescription>
                  Data tempat kerja dan praktik profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="unitKerja">Unit Kerja</Label>
                        <Input
                          id="unitKerja"
                          value={formData.unitKerja}
                          onChange={(e) => handleInputChange('unitKerja', e.target.value)}
                          placeholder="Departemen Pulmonologi"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan</Label>
                        <Input
                          id="jabatan"
                          value={formData.jabatan}
                          onChange={(e) => handleInputChange('jabatan', e.target.value)}
                          placeholder="Dokter Spesialis"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tahunLulus">Tahun Lulus</Label>
                        <Input
                          id="tahunLulus"
                          value={formData.tahunLulus}
                          onChange={(e) => handleInputChange('tahunLulus', e.target.value)}
                          placeholder="2010"
                          type="number"
                          min="1970"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Institusi Tempat Praktik</h4>
                    <div className="space-y-6">
                      {/* Tempat Praktek 1 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek1">Tempat Praktek 1</Label>
                          <Input
                            id="tempatPraktek1"
                            value={formData.tempatPraktek1}
                            onChange={(e) => handleInputChange('tempatPraktek1', e.target.value)}
                            placeholder="Nama RS / Klinik"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek1Tipe">Tipe Tempat Praktek 1</Label>
                          <Select 
                            value={formData.tempatPraktek1Tipe} 
                            onValueChange={(value) => handleInputChange('tempatPraktek1Tipe', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                              <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                              <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                              <SelectItem value="Klinik Pribadi">Klinik Pribadi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tempat Praktek 2 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek2">Tempat Praktek 2</Label>
                          <Input
                            id="tempatPraktek2"
                            value={formData.tempatPraktek2}
                            onChange={(e) => handleInputChange('tempatPraktek2', e.target.value)}
                            placeholder="Nama RS / Klinik"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek2Tipe">Tipe Tempat Praktek 2</Label>
                          <Select 
                            value={formData.tempatPraktek2Tipe} 
                            onValueChange={(value) => handleInputChange('tempatPraktek2Tipe', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                              <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                              <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                              <SelectItem value="Klinik Pribadi">Klinik Pribadi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tempat Praktek 3 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek3">Tempat Praktek 3</Label>
                          <Input
                            id="tempatPraktek3"
                            value={formData.tempatPraktek3}
                            onChange={(e) => handleInputChange('tempatPraktek3', e.target.value)}
                            placeholder="Nama RS / Klinik"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempatPraktek3Tipe">Tipe Tempat Praktek 3</Label>
                          <Select 
                            value={formData.tempatPraktek3Tipe} 
                            onValueChange={(value) => handleInputChange('tempatPraktek3Tipe', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="RS Tipe A">RS Tipe A</SelectItem>
                              <SelectItem value="RS Tipe B">RS Tipe B</SelectItem>
                              <SelectItem value="RS Tipe C">RS Tipe C</SelectItem>
                              <SelectItem value="Klinik Pribadi">Klinik Pribadi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Legal</CardTitle>
                <CardDescription>
                  Dokumen dan perizinan profesional anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK *</Label>
                      <Input
                        id="nik"
                        value={formData.nik}
                        onChange={(e) => handleInputChange('nik', e.target.value)}
                        placeholder="1234567890123456"
                        maxLength={16}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="noSTR">Nomor STR *</Label>
                      <Input
                        id="noSTR"
                        value={formData.noSTR}
                        onChange={(e) => handleInputChange('noSTR', e.target.value)}
                        placeholder="STR123456789"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>STR Berlaku Sampai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.strBerlakuSampai && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.strBerlakuSampai ? (
                              format(formData.strBerlakuSampai, "dd MMMM yyyy")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <EnhancedCalendar
                            mode="single"
                            selected={formData.strBerlakuSampai}
                            onSelect={(date) => handleInputChange('strBerlakuSampai', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            enableYearMonthSelect={true}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="noSIP">Nomor SIP</Label>
                      <Input
                        id="noSIP"
                        value={formData.noSIP}
                        onChange={(e) => handleInputChange('noSIP', e.target.value)}
                        placeholder="SIP123456789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SIP Berlaku Sampai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.sipBerlakuSampai && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.sipBerlakuSampai ? (
                              format(formData.sipBerlakuSampai, "dd MMMM yyyy")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <EnhancedCalendar
                            mode="single"
                            selected={formData.sipBerlakuSampai}
                            onSelect={(date) => handleInputChange('sipBerlakuSampai', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            enableYearMonthSelect={true}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tahunLulus">Tahun Lulus</Label>
                      <Input
                        id="tahunLulus"
                        value={formData.tahunLulus}
                        onChange={(e) => handleInputChange('tahunLulus', e.target.value)}
                        placeholder="2010"
                        type="number"
                        min="1970"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kontak Tab */}
          <TabsContent value="kontak">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>
                  Data kontak dan komunikasi anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kontakEmail">Email *</Label>
                      <Input
                        id="kontakEmail"
                        type="email"
                        value={formData.kontakEmail}
                        onChange={(e) => handleInputChange('kontakEmail', e.target.value)}
                        placeholder="dokter@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kontakTelepon">Nomor Telepon *</Label>
                      <Input
                        id="kontakTelepon"
                        type="tel"
                        value={formData.kontakTelepon}
                        onChange={(e) => handleInputChange('kontakTelepon', e.target.value)}
                        placeholder="081234567890"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Catatan Kontak</h4>
                      <p className="text-sm text-muted-foreground">
                        Email dan nomor telepon akan digunakan untuk komunikasi resmi dari PDPI. 
                        Pastikan informasi yang dimasukkan aktif dan dapat dihubungi.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media & Website</CardTitle>
                <CardDescription>
                  Informasi website dan media sosial anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website Pribadi</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.dokteranda.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sosialMedia">Media Sosial</Label>
                      <Textarea
                        id="sosialMedia"
                        value={formData.sosialMedia}
                        onChange={(e) => handleInputChange('sosialMedia', e.target.value)}
                        placeholder="Instagram: @dokter_anda&#10;LinkedIn: linkedin.com/in/dokter-anda&#10;Twitter: @dokter_anda"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Panduan Media Sosial</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Cantumkan akun media sosial yang bersifat profesional</li>
                        <li>• Gunakan format: Platform: @username atau URL lengkap</li>
                        <li>• Pisahkan setiap platform dengan baris baru</li>
                        <li>• Informasi ini akan ditampilkan di profil publik anggota</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status Keanggotaan *</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Biasa">Biasa</SelectItem>
                          <SelectItem value="Luar Biasa">Luar Biasa</SelectItem>
                          <SelectItem value="Meninggal">Meninggal</SelectItem>
                          <SelectItem value="Muda">Muda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
        </>
      )}
    </div>
  );
}