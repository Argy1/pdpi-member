import { Member } from "@/types/member"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, MapPin, Building } from "lucide-react"

interface PublicMemberCardProps {
  member: Member
}

export function PublicMemberCard({ member }: PublicMemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={member.foto || member.fotoUrl} 
                alt={`Foto ${member.nama}`}
                className="object-cover"
                onError={(e) => {
                  console.warn('Failed to load image:', member.foto);
                }}
              />
              <AvatarFallback className="text-lg font-semibold bg-medical-primary/10 text-medical-primary">
                {getInitials(member.nama)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Member Information */}
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex">
                <span className="font-medium w-32">Nama</span>
                <span className="mr-2">:</span>
                <span className="font-semibold text-medical-primary">{member.nama}</span>
                {member.gelar && <span className="text-muted-foreground ml-1">{member.gelar}</span>}
              </div>

              <div className="flex">
                <span className="font-medium w-32">Cabang</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.cabang || member.provinsi || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-32">Kota/Kabupaten Kantor</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.kota_kabupaten_kantor || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-32">Provinsi Kantor</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.provinsi_kantor || '-'}
                </span>
              </div>

              {/* Hospital Practice Info */}
              {(member.rs_tipe_a || member.rs_tipe_b || member.rs_tipe_c || member.klinik_pribadi) && (
                <>
                  {member.rs_tipe_a && (
                    <div className="flex">
                      <span className="font-medium w-32">RS Tipe A</span>
                      <span className="mr-2">:</span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {member.rs_tipe_a}
                      </span>
                    </div>
                  )}
                  {member.rs_tipe_b && (
                    <div className="flex">
                      <span className="font-medium w-32">RS Tipe B</span>
                      <span className="mr-2">:</span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {member.rs_tipe_b}
                      </span>
                    </div>
                  )}
                  {member.rs_tipe_c && (
                    <div className="flex">
                      <span className="font-medium w-32">RS Tipe C</span>
                      <span className="mr-2">:</span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {member.rs_tipe_c}
                      </span>
                    </div>
                  )}
                  {member.klinik_pribadi && (
                    <div className="flex">
                      <span className="font-medium w-32">Klinik Pribadi</span>
                      <span className="mr-2">:</span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {member.klinik_pribadi}
                      </span>
                    </div>
                  )}
                </>
              )}

              {member.email && (
                <div className="flex">
                  <span className="font-medium w-32">Email</span>
                  <span className="mr-2">:</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a 
                      href={`mailto:${member.email}`} 
                      className="text-medical-primary hover:underline"
                    >
                      {member.email}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}