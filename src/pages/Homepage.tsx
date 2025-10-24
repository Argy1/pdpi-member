import { Link } from "react-router-dom"
import { Users, MapPin, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/StatCard"
import { SearchBar } from "@/components/SearchBar"
import { ProvinceChips } from "@/components/ProvinceChips"
import { HowToUse } from "@/components/HowToUse"
import { useStats } from "@/hooks/useStats"
import logoImage from "@/assets/logo-pdpi.png"

export default function Homepage() {
  // Use Stats API to get accurate total from database
  const { summary, loading } = useStats({})

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-spacing bg-gradient-subtle bg-grid">
        <div className="container-pdpi">
          <div className="relative">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              {/* Logo and Title */}
              <div className="flex flex-col items-center space-y-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-white shadow-xl">
                  <img 
                    src={logoImage} 
                    alt="PDPI Logo" 
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold heading-medical">
                    Daftar Anggota{" "}
                    <span className="text-primary">
                      PDPI
                    </span>
                  </h1>
                  <p className="text-xl text-medical-body max-w-2xl mx-auto">
                    Direktori lengkap anggota Perhimpunan Dokter Paru Indonesia untuk kemudahan akses informasi profesional
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="h-12 px-8 rounded-xl font-semibold focus-visible"
                  asChild
                >
                  <Link to="/anggota">
                    Buka Tabel Anggota
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-spacing">
        <div className="container-pdpi">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Anggota"
              value={loading ? "..." : (summary?.total || 0).toLocaleString('id-ID')}
              description="Dokter Spesialis Paru"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Provinsi"
              value={loading ? "..." : (summary?.byProvinsi.length || 0).toString()}
              description="Seluruh Indonesia"
              icon={MapPin}
            />
            <StatCard
              title="Cabang/PD"
              value={loading ? "..." : (summary?.byCabang.length || 0).toString()}
              description="Pengurus Daerah"
              icon={Building2}
              trend={{ value: 3, isPositive: true }}
            />
          </div>
        </div>
      </section>

      {/* Global Search Section */}
      <section className="section-spacing bg-muted/30">
        <div className="container-pdpi">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold heading-medical">
                Cari Anggota PDPI
              </h2>
              <p className="text-lg text-medical-body">
                Temukan dokter spesialis paru berdasarkan nama, rumah sakit, atau lokasi
              </p>
            </div>

            {/* Hero Search Bar */}
            <div className="space-y-6">
              <SearchBar 
                size="hero"
                className="max-w-2xl mx-auto"
              />
              
              {/* Province Quick Chips */}
              <div className="max-w-2xl mx-auto">
                <ProvinceChips />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <HowToUse />

      {/* Data Source Note */}
      <section className="section-spacing bg-muted/20">
        <div className="container-pdpi">
          <div className="card-glass p-6 max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold heading-medical mb-3">
              Sumber Data
            </h3>
            <p className="text-medical-body">
              Data anggota ini dikelola oleh Pengurus Pusat PDPI dan diperbarui secara berkala. 
              Untuk informasi lebih lanjut atau koreksi data, silakan hubungi sekretariat PDPI.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}