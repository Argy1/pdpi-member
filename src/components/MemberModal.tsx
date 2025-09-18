import { Member } from "@/types/member"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
          <div className="flex items-start justify-between">
            <div className="space-y-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="focus-visible"
            >
              <X className="h-4 w-4" />
            </Button>
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
                <p className="text-medical-body">{member.tempatLahir || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tanggal Lahir</p>
                <p className="text-medical-body">{formatDate(member.tanggalLahir)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                <p className="text-medical-body">
                  {member.jenisKelamin === "L" ? "Laki-laki" : member.jenisKelamin === "P" ? "Perempuan" : "-"}
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
                <p className="text-sm font-medium text-muted-foreground">Spesialis</p>
                <p className="text-medical-body">{member.spesialis || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Subspesialis</p>
                <p className="text-medical-body">{member.subspesialis || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                <p className="text-medical-body">{member.jabatan || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tahun Lulus</p>
                <p className="text-medical-body">{member.tahunLulus || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Alumni</p>
                <p className="text-medical-body">{member.alumni || "-"}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Alamat</p>
                <p className="text-medical-body">{member.alamat || "-"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kota</p>
                  <p className="text-medical-body">{member.kota || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Provinsi</p>
                  <p className="text-medical-body">{member.provinsi || "-"}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rumah Sakit</p>
                <p className="text-medical-body">{member.rumahSakit || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unit Kerja</p>
                <p className="text-medical-body">{member.unitKerja || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cabang/Wilayah</p>
                <p className="text-medical-body">{member.pd || "-"}</p>
              </div>
            </div>
          </div>

          {/* Contact Info (Public only) */}
          {(member.kontakEmail || member.website) && (
            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-semibold heading-medical">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Kontak Publik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.kontakEmail && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a 
                      href={`mailto:${member.kontakEmail}`}
                      className="text-primary hover:underline transition-smooth"
                    >
                      {member.kontakEmail}
                    </a>
                  </div>
                )}
                {member.website && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    <a 
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline transition-smooth"
                    >
                      {member.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

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