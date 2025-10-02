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

  const practiceLocations = [
    { name: member.tempat_praktek_1, type: member.tempat_praktek_1_tipe },
    { name: member.tempat_praktek_2, type: member.tempat_praktek_2_tipe },
    { name: member.tempat_praktek_3, type: member.tempat_praktek_3_tipe },
  ].filter(loc => loc.name)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side: Basic Information */}
          <div className="flex gap-4 flex-shrink-0">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage 
                  src={member.foto || member.fotoUrl} 
                  alt={`Foto ${member.nama}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg md:text-xl font-semibold bg-medical-primary/10 text-medical-primary">
                  {getInitials(member.nama)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-1.5 text-sm">
              <div className="flex">
                <span className="font-medium w-28 md:w-32 flex-shrink-0">Nama</span>
                <span className="mr-2">:</span>
                <span className="font-semibold text-medical-primary">
                  {member.gelar && <span className="text-muted-foreground mr-1">{member.gelar}</span>}
                  {member.nama}
                  {member.gelar2 && <span className="text-muted-foreground ml-1">{member.gelar2}</span>}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-28 md:w-32 flex-shrink-0">Cabang</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  {member.cabang || member.provinsi || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-28 md:w-32 flex-shrink-0">Kota/Kabupaten</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  {member.kota_kabupaten_kantor || '-'}
                </span>
              </div>

              <div className="flex">
                <span className="font-medium w-28 md:w-32 flex-shrink-0">Provinsi</span>
                <span className="mr-2">:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  {member.provinsi_kantor || '-'}
                </span>
              </div>

              {member.email && (
                <div className="flex">
                  <span className="font-medium w-28 md:w-32 flex-shrink-0">Email</span>
                  <span className="mr-2">:</span>
                  <span className="flex items-center gap-1 break-all">
                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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

          {/* Right Side: Practice Locations */}
          {practiceLocations.length > 0 && (
            <div className="flex-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
              <h3 className="font-semibold text-sm mb-3 underline">Tempat Praktik</h3>
              <div className="space-y-2 text-sm">
                {practiceLocations.map((location, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-medium flex-shrink-0">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="font-medium">{location.name}</span>
                        {location.type && (
                          <>
                            <span className="text-muted-foreground">:</span>
                            <span className="text-muted-foreground">
                              RS.............. (Tipe RS: {location.type})
                            </span>
                            <span className="text-muted-foreground">
                              Kota/Kabupaten: {member.kota_kabupaten_kantor || '-'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}