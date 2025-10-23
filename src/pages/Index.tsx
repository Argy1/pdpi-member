import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Building2, Search, ArrowRight, Sparkles, Filter, Eye } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { SearchBar } from "@/components/SearchBar";
import { ProvinceChips } from "@/components/ProvinceChips";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import pdpiLogo from "@/assets/logo-pdpi.png";

const Index = () => {
  const navigate = useNavigate();
  const { summary, loading } = useStats({});

  const lastUpdated = useMemo(() => {
    if (!summary) return new Date();
    return new Date();
  }, [summary]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/30 dark:bg-sky-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="relative mx-auto max-w-5xl">
              {/* Animated Background Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-900/10 rounded-3xl backdrop-blur-xl shadow-2xl" />

              <div className="relative p-8 md:p-14 text-center">
                {/* Logo Badge with Update Time */}
                <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/90 dark:bg-slate-900/90 px-5 py-3 shadow-xl backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                    <img src={pdpiLogo} alt="PDPI Logo" className="h-10 w-auto" />
                    <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Update: {formatDate(lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Title with Gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 dark:from-emerald-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  Direktori Anggota PDPI
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                  Direktori lengkap anggota Perhimpunan Dokter Paru Indonesia untuk kemudahan akses informasi
                  profesional di seluruh nusantara.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <Button
                    size="lg"
                    onClick={() => navigate("/anggota")}
                    className="w-full sm:w-auto rounded-2xl px-8 py-6 text-base font-bold shadow-2xl hover:shadow-emerald-500/50 dark:hover:shadow-emerald-900/50 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    Buka Tabel Anggota
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/sebaran")}
                    className="w-full sm:w-auto rounded-2xl px-8 py-6 text-base font-bold border-2 border-emerald-300 dark:border-emerald-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Sebaran Anggota (Peta)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {loading ? (
              <>
                <Skeleton className="h-48 rounded-3xl" />
                <Skeleton className="h-48 rounded-3xl" />
                <Skeleton className="h-48 rounded-3xl" />
              </>
            ) : (
              <>
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-900/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Total Anggota
                      </p>
                      <p className="text-5xl md:text-6xl font-black bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                        {summary?.total.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Dokter Spesialis Paru</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-sky-200/50 dark:border-sky-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/30 dark:bg-sky-900/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                        Provinsi
                      </p>
                      <p className="text-5xl md:text-6xl font-black bg-gradient-to-br from-sky-600 to-sky-800 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                        {summary?.byProvinsi.length || 0}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Seluruh Indonesia</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/30 dark:bg-slate-700/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Cabang/PD
                      </p>
                      <p className="text-5xl md:text-6xl font-black bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 bg-clip-text text-transparent">
                        {summary?.byCabang.length || 0}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pengurus Daerah</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-8 md:p-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
                    Cari Anggota
                  </h2>
                </div>
                <SearchBar size="hero" placeholder="Cari nama, NPA, RS, kota, provinsi, atau PD..." />
              </div>
            </div>

            <ProvinceChips />
          </div>
        </section>

        {/* How to Use Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400 bg-clip-text text-transparent mb-4">
              Panduan Menggunakan
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Ikuti langkah mudah untuk menemukan informasi anggota yang Anda butuhkan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">1. Cari Anggota</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Masukkan nama, NPA, nama RS, atau lokasi di kolom pencarian untuk menemukan anggota
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/20 dark:bg-sky-900/20 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Filter className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">2. Filter Data</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gunakan filter provinsi, cabang/PD, atau kota untuk mempersempit hasil pencarian
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/70 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/20 dark:bg-slate-700/20 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">3. Lihat Detail</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Klik pada nama anggota untuk melihat informasi lengkap dan kontak profesional
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
