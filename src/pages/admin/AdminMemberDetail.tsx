import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User, GraduationCap, Building2 } from 'lucide-react';
import { Member } from '@/types/member';
import { supabase } from '@/integrations/supabase/client';

export default function AdminMemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Member not found');
        }
        
        setMember(data as Member);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch member');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/anggota">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Anggota</h1>
            <p className="text-muted-foreground">Memuat data anggota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/anggota">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Anggota</h1>
            <p className="text-muted-foreground text-red-600">
              {error || 'Anggota tidak ditemukan'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AKTIF':
      case 'Aktif':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case 'PENDING':
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'TIDAK_AKTIF':
      case 'Nonaktif':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Nonaktif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            <h1 className="text-3xl font-bold tracking-tight">Detail Anggota</h1>
            <p className="text-muted-foreground">
              Informasi lengkap anggota PDPI
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/admin/anggota/${member.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Data
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Header Card with Photo and Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex justify-center md:justify-start">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={member.foto || member.fotoUrl} />
                  <AvatarFallback className="text-2xl">
                    {member.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{member.nama}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.gelar && <Badge variant="outline">{member.gelar}</Badge>}
                    {member.gelar2 && <Badge variant="outline">{member.gelar2}</Badge>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">NPA: {member.npa || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status: {getStatusBadge(member.status || 'Biasa')}</span>
                  </div>
                  {member.spesialis && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.spesialis}</span>
                    </div>
                  )}
                  {member.subspesialis && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.subspesialis}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
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
                   member.jenis_kelamin === 'P' ? 'Perempuan' : 
                   member.jenisKelamin === 'L' ? 'Laki-laki' :
                   member.jenisKelamin === 'P' ? 'Perempuan' : '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tempat, Tanggal Lahir</label>
                <p className="mt-1">
                  {[
                    member.tempat_lahir || member.tempatLahir,
                    member.tgl_lahir || member.tanggalLahir
                  ].filter(Boolean).join(', ') || '-'}
                </p>
              </div>

              {member.alumni && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alumni</label>
                  <p className="mt-1">{member.alumni}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tahun Lulus</label>
                <p className="mt-1">{member.thn_lulus || member.tahunLulus || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1 flex items-center gap-2">
                  {member.email || member.kontakEmail ? (
                    <>
                      <Mail className="h-4 w-4" />
                      {member.email || member.kontakEmail}
                    </>
                  ) : '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">No. HP</label>
                <p className="mt-1 flex items-center gap-2">
                  {member.no_hp || member.kontakTelepon ? (
                    <>
                      <Phone className="h-4 w-4" />
                      {member.no_hp || member.kontakTelepon}
                    </>
                  ) : '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <p className="mt-1">{member.website || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Media Sosial</label>
                <p className="mt-1">{member.sosialMedia || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
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
                <p className="mt-1">{member.tempat_tugas || member.rumahSakit || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Kerja</label>
                <p className="mt-1">{member.unitKerja || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jabatan</label>
                <p className="mt-1">{member.jabatan || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cabang/PD</label>
                <p className="mt-1">{member.cabang || member.pd || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informasi Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat Kerja</label>
                <p className="mt-1">
                  {[
                    member.kota_kabupaten || member.kota,
                    member.provinsi
                  ].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat Rumah</label>
                <p className="mt-1">
                  {member.alamat_rumah || member.alamatRumah || member.alamat || '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kota/Kabupaten Rumah</label>
                <p className="mt-1">
                  {[
                    member.kota_kabupaten_rumah || member.kotaRumah,
                    member.provinsi_rumah || member.provinsiRumah
                  ].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {member.keterangan && (
          <Card>
            <CardHeader>
              <CardTitle>Keterangan</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{member.keterangan}</p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tanggal Bergabung</label>
              <p className="mt-1">
                {new Date(member.created_at || member.createdAt || '').toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</label>
              <p className="mt-1">
                {new Date(member.updated_at || member.updatedAt || '').toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}