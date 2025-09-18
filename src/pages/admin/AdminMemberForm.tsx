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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, ArrowLeft, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMemberContext } from '@/contexts/MemberContext';
import { ExcelImport } from '@/components/admin/ExcelImport';

interface MemberFormData {
  // Identitas
  nama: string;
  gelar: string;
  npa: string;
  spesialis: string;
  subspesialis: string;
  tempatLahir: string;
  tanggalLahir: Date | undefined;
  jenisKelamin: string;
  foto: string;
  
  // Domisili
  alamat: string;
  kota: string;
  provinsi: string;
  pd: string;
  
  // Profesi
  rumahSakit: string;
  unitKerja: string;
  jabatan: string;
  
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
  npa: '',
  spesialis: '',
  subspesialis: '',
  tempatLahir: '',
  tanggalLahir: undefined,
  jenisKelamin: '',
  foto: '',
  alamat: '',
  kota: '',
  provinsi: '',
  pd: '',
  rumahSakit: '',
  unitKerja: '',
  jabatan: '',
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
  status: 'Aktif',
};

export default function AdminMemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { members, addMember, updateMember } = useMemberContext();
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const isEditing = Boolean(id && id !== 'new');
  const pageTitle = isEditing ? 'Edit Anggota' : 'Tambah Anggota Baru';

  useEffect(() => {
    if (isEditing && id) {
      // Find member by ID from context
      const existingMember = members.find(m => m.id === id);
      if (existingMember) {
        const memberFormData = {
          nama: existingMember.nama,
          gelar: existingMember.gelar,
          npa: existingMember.npa,
          spesialis: existingMember.spesialis,
          subspesialis: existingMember.subspesialis,
          tempatLahir: existingMember.tempatLahir,
          tanggalLahir: existingMember.tanggalLahir ? new Date(existingMember.tanggalLahir) : undefined,
          jenisKelamin: existingMember.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          foto: existingMember.fotoUrl,
          alamat: existingMember.alamat,
          kota: existingMember.kota,
          provinsi: existingMember.provinsi,
          pd: existingMember.pd,
          rumahSakit: existingMember.rumahSakit,
          unitKerja: existingMember.unitKerja,
          jabatan: existingMember.jabatan,
          nik: existingMember.nik,
          noSTR: existingMember.noSTR,
          strBerlakuSampai: existingMember.strBerlakuSampai ? new Date(existingMember.strBerlakuSampai) : undefined,
          noSIP: existingMember.noSIP,
          sipBerlakuSampai: existingMember.sipBerlakuSampai ? new Date(existingMember.sipBerlakuSampai) : undefined,
          tahunLulus: existingMember.tahunLulus?.toString() || '',
          kontakEmail: existingMember.kontakEmail,
          kontakTelepon: existingMember.kontakTelepon,
          website: existingMember.website,
          sosialMedia: existingMember.sosialMedia,
          status: existingMember.status === 'AKTIF' ? 'Aktif' : existingMember.status === 'PENDING' ? 'Pending' : 'Tidak Aktif',
        };
        setFormData(memberFormData);
        setPhotoPreview(existingMember.fotoUrl);
      }
    }
  }, [id, isEditing, members]);

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        handleInputChange('foto', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing) {
        updateMember(id!, formData);
      } else {
        addMember(formData);
      }
      
      toast({
        title: isEditing ? 'Data anggota diperbarui' : 'Anggota baru ditambahkan',
        description: `Data ${formData.nama} berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`,
      });
      
      navigate('/admin/anggota');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data anggota.',
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
                      <Label htmlFor="gelar">Gelar</Label>
                      <Input
                        id="gelar"
                        value={formData.gelar}
                        onChange={(e) => handleInputChange('gelar', e.target.value)}
                        placeholder="Sp.P, M.Kes, dll"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="npa">Nomor Peserta Anggota (NPA) *</Label>
                      <Input
                        id="npa"
                        value={formData.npa}
                        onChange={(e) => handleInputChange('npa', e.target.value)}
                        placeholder="NPA123456"
                        required
                      />
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
                            <Calendar
                              mode="single"
                              selected={formData.tanggalLahir}
                              onSelect={(date) => handleInputChange('tanggalLahir', date)}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="pointer-events-auto"
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
                      <Label htmlFor="kota">Kota/Kabupaten</Label>
                      <Input
                        id="kota"
                        value={formData.kota}
                        onChange={(e) => handleInputChange('kota', e.target.value)}
                        placeholder="Jakarta"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="provinsi">Provinsi</Label>
                      <Select 
                        value={formData.provinsi} 
                        onValueChange={(value) => handleInputChange('provinsi', value)}
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
                      <Label htmlFor="pd">Cabang/Wilayah</Label>
                      <Select 
                        value={formData.pd} 
                        onValueChange={(value) => handleInputChange('pd', value)}
                      >
                        <SelectTrigger>
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
                          <SelectItem value="Cabang Maluku Utara & Maluku">Cabang Maluku Utara & Maluku</SelectItem>
                          <SelectItem value="Cabang Papua">Cabang Papua</SelectItem>
                        </SelectContent>
                      </Select>
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
                  Data tempat kerja dan jabatan profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rumahSakit">Rumah Sakit/Institusi</Label>
                      <Input
                        id="rumahSakit"
                        value={formData.rumahSakit}
                        onChange={(e) => handleInputChange('rumahSakit', e.target.value)}
                        placeholder="RSUP Dr. Cipto Mangunkusumo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unitKerja">Unit Kerja</Label>
                      <Input
                        id="unitKerja"
                        value={formData.unitKerja}
                        onChange={(e) => handleInputChange('unitKerja', e.target.value)}
                        placeholder="Departemen Pulmonologi"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan</Label>
                      <Input
                        id="jabatan"
                        value={formData.jabatan}
                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                        placeholder="Dokter Spesialis"
                      />
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
                          <Calendar
                            mode="single"
                            selected={formData.strBerlakuSampai}
                            onSelect={(date) => handleInputChange('strBerlakuSampai', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
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
                          <Calendar
                            mode="single"
                            selected={formData.sipBerlakuSampai}
                            onSelect={(date) => handleInputChange('sipBerlakuSampai', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
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
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
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
    </div>
  );
}