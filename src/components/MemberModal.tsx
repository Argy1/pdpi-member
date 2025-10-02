import { Member } from "@/types/member"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  MapPin, 
  Building2, 
  Calendar, 
  Mail, 
  Phone,
  Globe,
  Stethoscope,
  GraduationCap,
  X
} from "lucide-react"

interface MemberModalProps {
  member: Member | null
  open: boolean
  onClose: () => void
}

export function MemberModal({ member, open, onClose }: MemberModalProps) {
  if (!member) return null

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Biasa":
        return <Badge className="bg-success/10 text-success border-success/20">Biasa</Badge>
      case "Luar Biasa":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Luar Biasa</Badge>
      case "Meninggal":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Meninggal</Badge>
      case "Muda":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Muda</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex gap-4">
            {/* Member Photo */}
            <div className="flex-shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={member.foto || member.fotoUrl} 
                  alt={`Foto ${member.nama}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-medical-primary/10 text-medical-primary">
                  {member.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Member Info */}
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl font-bold heading-medical">
                {member.nama}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {getStatusBadge(member.status)}
                {member.npa && (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    NPA: {member.npa}
                  </code>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <User className="h-5 w-5 mr-2 text-primary" />
              Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tempat Lahir</p>
                <p className="text-medical-body">{member.tempatLahir || member.tempat_lahir || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tanggal Lahir</p>
                <p className="text-medical-body">{formatDate(member.tanggalLahir || member.tgl_lahir)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                <p className="text-medical-body">
                  {member.jenisKelamin === "L" || member.jenis_kelamin === "L" ? "Laki-laki" : 
                   member.jenisKelamin === "P" || member.jenis_kelamin === "P" ? "Perempuan" : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gelar 1</p>
                <p className="text-medical-body">{member.gelar || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gelar 2</p>
                <p className="text-medical-body">{member.gelar2 || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Alumni</p>
                <p className="text-medical-body">{member.alumni || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">NIK</p>
                <p className="text-medical-body">{member.nik || "-"}</p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <Stethoscope className="h-5 w-5 mr-2 text-primary" />
              Informasi Profesi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="text-medical-body">{member.jabatan || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tahun Lulus</p>
                <p className="text-medical-body">{member.tahunLulus || member.thn_lulus || "-"}</p>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Dokumen Legal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">No. STR</p>
                <p className="text-medical-body">{member.noSTR || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">STR Berlaku Sampai</p>
                <p className="text-medical-body">{formatDate(member.strBerlakuSampai)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">No. SIP</p>
                <p className="text-medical-body">{member.noSIP || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">SIP Berlaku Sampai</p>
                <p className="text-medical-body">{formatDate(member.sipBerlakuSampai)}</p>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Lokasi & Alamat
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Alamat Lengkap</p>
                <p className="text-medical-body">{member.alamat || member.alamat_rumah || "-"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kota/Kabupaten Kantor</p>
                  <p className="text-medical-body">{member.kota_kabupaten_kantor || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Provinsi Kantor</p>
                  <p className="text-medical-body">{member.provinsi_kantor || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kota/Kabupaten Rumah</p>
                  <p className="text-medical-body">{member.kota_kabupaten_rumah || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Provinsi Rumah</p>
                  <p className="text-medical-body">{member.provinsi_rumah || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Info */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <Building2 className="h-5 w-5 mr-2 text-primary" />
              Institusi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unit Kerja</p>
                <p className="text-medical-body">{member.unitKerja || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="text-medical-body">{member.jabatan || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cabang/PD</p>
                <p className="text-medical-body">{member.pd || member.cabang || "-"}</p>
              </div>
            </div>
            
            {/* Hospital Practice Info */}
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tempat Praktek 1</p>
                  <p className="text-medical-body">
                    {member.tempat_praktek_1 || "-"}
                    {member.tempat_praktek_1 && member.tempat_praktek_1_tipe && (
                      <span className="text-xs text-muted-foreground ml-2">({member.tempat_praktek_1_tipe})</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tempat Praktek 2</p>
                  <p className="text-medical-body">
                    {member.tempat_praktek_2 || "-"}
                    {member.tempat_praktek_2 && member.tempat_praktek_2_tipe && (
                      <span className="text-xs text-muted-foreground ml-2">({member.tempat_praktek_2_tipe})</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tempat Praktek 3</p>
                  <p className="text-medical-body">
                    {member.tempat_praktek_3 || "-"}
                    {member.tempat_praktek_3 && member.tempat_praktek_3_tipe && (
                      <span className="text-xs text-muted-foreground ml-2">({member.tempat_praktek_3_tipe})</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-semibold heading-medical">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              Informasi Kontak
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-medical-body">
                  {member.kontakEmail || member.email ? (
                    <a 
                      href={`mailto:${member.kontakEmail || member.email}`}
                      className="text-primary hover:underline transition-smooth"
                    >
                      {member.kontakEmail || member.email}
                    </a>
                  ) : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">No. HP</p>
                <p className="text-medical-body">{member.kontakTelepon || member.no_hp || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <p className="text-medical-body">
                  {member.website ? (
                    <a 
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline transition-smooth"
                    >
                      {member.website}
                    </a>
                  ) : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Media Sosial</p>
                <p className="text-medical-body">{member.sosialMedia || "-"}</p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Terakhir diperbarui: {formatDate(member.updatedAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}