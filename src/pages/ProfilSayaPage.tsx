import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Phone, MapPin, GraduationCap, Building2, ArrowLeft } from 'lucide-react';

interface MemberData {
  id: string;
  nik?: string;
  npa?: string;
  nama: string;
  gelar?: string;
  gelar2?: string;
  status?: string;
  alumni?: string;
  thn_lulus?: number;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  email?: string;
  no_hp?: string;
  tempat_tugas?: string;
  jabatan?: string;
  cabang?: string;
  kota_kabupaten_kantor?: string;
  provinsi_kantor?: string;
  alamat_rumah?: string;
  foto?: string;
}

export default function ProfilSayaPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchMemberProfile = async () => {
      if (!user) return;

      try {
        // Temporarily show message until migration completes
        console.log('Fetching member profile for user:', user.id);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching member profile:', error);
        setLoading(false);
      }
    };

    fetchMemberProfile();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Profil Tidak Ditemukan</CardTitle>
            <CardDescription>
              Data profil Anda belum terhubung dengan akun anggota.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Profil Saya</h1>
            <p className="text-muted-foreground">Informasi lengkap anggota PDPI</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={member.foto} />
                <AvatarFallback className="text-2xl">
                  {member.nama?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold">{member.nama}</h2>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {member.gelar && <Badge variant="outline">{member.gelar}</Badge>}
                  {member.gelar2 && <Badge variant="outline">{member.gelar2}</Badge>}
                  {member.status && (
                    <Badge className={
                      member.status === 'Biasa' ? 'bg-success/10 text-success border-success/20' :
                      member.status === 'Luar Biasa' ? 'bg-primary/10 text-primary border-primary/20' :
                      'bg-muted'
                    }>
                      {member.status}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <User className="h-4 w-4" />
                    <span>NPA: {member.npa || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <GraduationCap className="h-4 w-4" />
                    <span>{member.alumni || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                <p className="mt-1">
                  {member.jenis_kelamin === 'L' ? 'Laki-laki' : 
                   member.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tempat, Tanggal Lahir</label>
                <p className="mt-1">
                  {member.tempat_lahir || '-'}
                  {member.tgl_lahir && `, ${new Date(member.tgl_lahir).toLocaleDateString('id-ID')}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tahun Lulus</label>
                <p className="mt-1">{member.thn_lulus || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1 flex items-center gap-2">
                  {member.email || user?.email || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">No. HP</label>
                <p className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {member.no_hp || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Kerja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tempat Tugas</label>
                <p className="mt-1">{member.tempat_tugas || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jabatan</label>
                <p className="mt-1">{member.jabatan || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cabang</label>
                <p className="mt-1">{member.cabang || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat</label>
                <p className="mt-1">{member.alamat_rumah || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kota/Kabupaten</label>
                <p className="mt-1">{member.kota_kabupaten_kantor || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                <p className="mt-1">{member.provinsi_kantor || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
