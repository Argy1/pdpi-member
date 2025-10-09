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
  ]

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Side: Photo and Basic Information */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 sm:gap-5">
            {/* Profile Photo */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage 
                  src={member.foto || member.fotoUrl} 
                  alt={`Foto ${member.nama}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-sm font-semibold bg-medical-primary/10 text-medical-primary">
                  {getInitials(member.nama)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2.5 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-sm sm:text-base mb-1 sm:mb-0 sm:w-36 lg:w-40 flex-shrink-0">Nama</span>
                <div className="flex gap-2">
                  <span className="hidden sm:inline">:</span>
                  <span className="font-semibold text-medical-primary text-base sm:text-lg">
                    {member.gelar && <span className="text-muted-foreground mr-1">{member.gelar}</span>}
                    {member.nama}
                    {member.gelar2 && <span className="text-muted-foreground ml-1">{member.gelar2}</span>}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-sm sm:text-base mb-1 sm:mb-0 sm:w-36 lg:w-40 flex-shrink-0">Cabang</span>
                <div className="flex gap-2">
                  <span className="hidden sm:inline">:</span>
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {member.cabang || member.provinsi || '-'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-sm sm:text-base mb-1 sm:mb-0 sm:w-36 lg:w-40 flex-shrink-0">Kota/Kabupaten</span>
                <div className="flex gap-2">
                  <span className="hidden sm:inline">:</span>
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {member.kota_kabupaten_kantor || '-'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-sm sm:text-base mb-1 sm:mb-0 sm:w-36 lg:w-40 flex-shrink-0">Provinsi</span>
                <div className="flex gap-2">
                  <span className="hidden sm:inline">:</span>
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {member.provinsi_kantor || '-'}
                  </span>
                </div>
              </div>

              {member.email && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-sm sm:text-base mb-1 sm:mb-0 sm:w-36 lg:w-40 flex-shrink-0">Email</span>
                  <div className="flex gap-2">
                    <span className="hidden sm:inline">:</span>
                    <span className="flex items-center gap-2 break-all text-sm sm:text-base">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${member.email}`} 
                        className="text-medical-primary hover:underline"
                      >
                        {member.email}
                      </a>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Practice Locations */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-base sm:text-lg mb-4 underline decoration-2 underline-offset-4">Tempat Praktik</h3>
            <div className="space-y-4">
              {practiceLocations.map((location, index) => (
                <div key={index} className="flex gap-3">
                  <span className="font-bold flex-shrink-0 text-base sm:text-lg">{index + 1}.</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="font-semibold text-base sm:text-lg text-medical-primary">
                      {location.name || '-'}
                    </div>
                    {location.name && location.type && (
                      <div className="space-y-1 text-sm sm:text-base text-muted-foreground">
                        <div className="flex flex-wrap gap-x-2">
                          <span className="font-medium">RS:</span>
                          <span>.............. (Tipe RS: <span className="font-semibold">{location.type}</span>)</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium">Kota/Kabupaten:</span>
                          <span className="font-semibold">{member.kota_kabupaten_kantor || '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}