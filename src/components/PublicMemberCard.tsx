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
                src={member.foto} 
                alt={`Foto ${member.nama}`}
                className="object-cover"
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
                <span className="font-medium w-32">Kota</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.kota_kabupaten || member.kota || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-32">Provinsi</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {member.provinsi || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-32">Tempat Praktik</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  {member.tempat_tugas || '-'}
                </span>
              </div>

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