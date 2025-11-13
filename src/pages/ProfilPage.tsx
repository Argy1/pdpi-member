import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNIKSync } from '@/hooks/useNIKSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Mail, Phone, MapPin, Briefcase, FileText, 
  Calendar, Award, Building, Edit, ArrowLeft 
} from 'lucide-react';
import { Member } from '@/types/member';

export default function ProfilPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Step 1: Get profile data with NIK
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

      setMember(memberData as Member);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-pdpi py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
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
              <h1 className="text-3xl font-bold heading-medical">Profil Saya</h1>
              <p className="text-muted-foreground mt-1">
                Lihat informasi profil dan data keanggotaan Anda
              </p>
            </div>
            <Button onClick={() => navigate('/profil/edit')} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profil
            </Button>
          </div>

          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={member.foto || undefined} alt={member.nama} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(member.nama)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      {member.gelar && `${member.gelar} `}
                      {member.nama}
                      {member.gelar2 && `, ${member.gelar2}`}
                    </h2>
                    <Badge variant="default" className="w-fit mx-auto sm:mx-0">
                      {member.status || 'AKTIF'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    NPA: <span className="font-semibold text-foreground">{member.npa}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {member.alumni && (
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {member.alumni}
                      </Badge>
                    )}
                    {member.cabang && (
                      <Badge variant="outline" className="gap-1">
                        <Building className="h-3 w-3" />
                        {member.cabang}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identitas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Identitas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoRow label="NIK" value={member.nik} />
              <InfoRow label="Nama Lengkap" value={member.nama} />
              <InfoRow label="Jenis Kelamin" value={member.jenis_kelamin} />
              <InfoRow label="Tempat Lahir" value={member.tempat_lahir} />
              <InfoRow 
                label="Tanggal Lahir" 
                value={member.tgl_lahir ? new Date(member.tgl_lahir).toLocaleDateString('id-ID') : undefined} 
              />
              <InfoRow label="Tahun Lulus" value={member.thn_lulus} />
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
            <CardContent className="grid gap-4">
              <InfoRow label="Email" value={member.email} icon={<Mail className="h-4 w-4" />} />
              <InfoRow label="No. HP" value={member.no_hp} icon={<Phone className="h-4 w-4" />} />
              <InfoRow label="Website" value={member.website} />
              <InfoRow label="Sosial Media" value={member.sosial_media} />
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
            <CardContent className="grid gap-4">
              <InfoRow label="Alamat" value={member.alamat_rumah} />
              <InfoRow label="Kota/Kabupaten" value={member.kota_kabupaten_rumah || member.kota_kabupaten} />
              <InfoRow label="Provinsi" value={member.provinsi_rumah || member.provinsi} />
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
            <CardContent className="grid gap-4">
              <InfoRow label="Tempat Tugas" value={member.tempat_tugas} />
              <InfoRow label="Jabatan" value={member.jabatan} />
              <InfoRow label="Subspesialis" value={member.subspesialis} />
              <InfoRow label="Gelar FISR" value={member.gelar_fisr} />
              <InfoRow label="Kota/Kabupaten Kantor" value={member.kota_kabupaten_kantor} />
              <InfoRow label="Provinsi Kantor" value={member.provinsi_kantor} />
            </CardContent>
          </Card>

          {/* Tempat Praktik */}
          {(member.tempat_praktek_1 || member.tempat_praktek_2 || member.tempat_praktek_3) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Tempat Praktik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {member.tempat_praktek_1 && (
                  <div>
                    <h4 className="font-semibold mb-2">Praktik 1</h4>
                    <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                      <InfoRow label="Nama Tempat" value={member.tempat_praktek_1} />
                      <InfoRow label="Tipe" value={member.tempat_praktek_1_tipe} />
                      <InfoRow label="Tipe 2" value={member.tempat_praktek_1_tipe_2} />
                      <InfoRow label="Alkes" value={member.tempat_praktek_1_alkes} />
                    </div>
                  </div>
                )}
                {member.tempat_praktek_2 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Praktik 2</h4>
                      <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                        <InfoRow label="Nama Tempat" value={member.tempat_praktek_2} />
                        <InfoRow label="Tipe" value={member.tempat_praktek_2_tipe} />
                        <InfoRow label="Kota/Kabupaten" value={member.kota_kabupaten_praktek_2} />
                        <InfoRow label="Provinsi" value={member.provinsi_praktek_2} />
                      </div>
                    </div>
                  </>
                )}
                {member.tempat_praktek_3 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Praktik 3</h4>
                      <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                        <InfoRow label="Nama Tempat" value={member.tempat_praktek_3} />
                        <InfoRow label="Tipe" value={member.tempat_praktek_3_tipe} />
                        <InfoRow label="Kota/Kabupaten" value={member.kota_kabupaten_praktek_3} />
                        <InfoRow label="Provinsi" value={member.provinsi_praktek_3} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dokumen Legal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Dokumen Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoRow label="No. STR" value={member.no_str} />
              <InfoRow 
                label="STR Berlaku Sampai" 
                value={member.str_berlaku_sampai ? new Date(member.str_berlaku_sampai).toLocaleDateString('id-ID') : undefined} 
              />
              <InfoRow label="No. SIP" value={member.no_sip} />
              <InfoRow 
                label="SIP Berlaku Sampai" 
                value={member.sip_berlaku_sampai ? new Date(member.sip_berlaku_sampai).toLocaleDateString('id-ID') : undefined} 
              />
            </CardContent>
          </Card>

          {/* Keterangan */}
          {member.keterangan && (
            <Card>
              <CardHeader>
                <CardTitle>Keterangan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{member.keterangan}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value?: string | number | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground min-w-[180px] flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-foreground font-medium">{value}</dd>
    </div>
  );
}
