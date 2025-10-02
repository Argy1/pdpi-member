import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Users, MapPin, Building2, Search, ArrowRight } from "lucide-react"
import { useStats } from "@/hooks/useStats"
import { StatCard } from "@/components/StatCard"
import { SearchBar } from "@/components/SearchBar"
import { ProvinceChips } from "@/components/ProvinceChips"
import { HowToUse } from "@/components/HowToUse"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import pdpiLogo from "@/assets/logo-pdpi.png"

const Index = () => {
  const navigate = useNavigate()
  const { summary, loading } = useStats({ status: 'AKTIF' })

  const lastUpdated = useMemo(() => {
    if (!summary) return new Date()
    return new Date()
  }, [summary])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="container-pdpi py-12 md:py-20">
          <div className="relative mx-auto max-w-5xl text-center">
            {/* Logo Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/80 px-4 py-2 shadow-lg backdrop-blur-sm">
              <img src={pdpiLogo} alt="PDPI Logo" className="h-8 w-auto" />
              <span className="text-sm font-medium text-muted-foreground">
                Terakhir diperbarui: {formatDate(lastUpdated)}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="heading-medical text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Direktori Anggota PDPI
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-medical-body mb-8 max-w-3xl mx-auto leading-relaxed">
              Temukan informasi dokter spesialis paru di seluruh Indonesia. 
              Cari berdasarkan nama, lokasi, atau cabang dengan mudah.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => navigate('/anggota')}
                className="rounded-xl px-6 py-6 text-base font-semibold shadow-strong hover:shadow-elegant transition-smooth"
              >
                Buka Tabel Anggota
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/sebaran')}
                className="rounded-xl px-6 py-6 text-base font-semibold transition-smooth"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Sebaran Anggota (Peta)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="container-pdpi py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <>
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Anggota"
                value={summary?.total.toLocaleString('id-ID') || "0"}
                description="Dokter Spesialis Paru"
                icon={Users}
              />
              <StatCard
                title="Provinsi"
                value={summary?.byProvinsi.length || 0}
                description="Seluruh Indonesia"
                icon={MapPin}
              />
              <StatCard
                title="Cabang/PD"
                value={summary?.byCabang.length || 0}
                description="Pengurus Daerah"
                icon={Building2}
              />
            </>
          )}
        </div>
      </section>

      {/* Search Section */}
      <section className="container-pdpi py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="card-glass p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold heading-medical">
                Cari Anggota
              </h2>
            </div>
            <SearchBar 
              size="hero"
              placeholder="Cari nama, NPA, RS, kota, provinsi, atau PD..."
            />
          </div>

          <ProvinceChips />
        </div>
      </section>

      {/* How to Use Section */}
      <section className="container-pdpi py-12">
        <HowToUse />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Index
