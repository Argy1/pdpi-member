import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { SearchBar } from "@/components/SearchBar";
import { ProvinceChips } from "@/components/ProvinceChips";
import { HowToUse } from "@/components/HowToUse";
import { useStats } from "@/hooks/useStats";
import { getAllProvinces } from "@/utils/getAllProvinces";
import logoImage from "@/assets/logo-pdpi.png";

export default function Homepage() {
  // Use Stats API to get accurate totals from database
  const { summary, loading } = useStats({});

  // Get total provinces from centroids (39 provinces) - not from database
  const [totalProvinces, setTotalProvinces] = useState<number>(39);

  useEffect(() => {
    // Load all provinces from centroids to get accurate count
    getAllProvinces().then((provinces) => {
      setTotalProvinces(provinces.length);
      console.log("Total provinces from centroids:", provinces.length, provinces);
    });
  }, []);

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
                  <img src={logoImage} alt="PDPI Logo" className="h-20 w-20 object-contain" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold heading-medical">
                    Daftar Anggota <span className="text-primary">PDPI</span>
                  </h1>
                  <p className="text-xl text-medical-body max-w-2xl mx-auto">
                    Direktori lengkap anggota Perhimpunan Dokter Paru Indonesia untuk kemudahan akses informasi
                    profesional
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Button size="lg" className="h-12 px-8 rounded-xl font-semibold focus-visible" asChild>
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
              value={loading ? "..." : (summary?.total || 0).toLocaleString("id-ID")}
              description="Dokter Spesialis Paru"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Provinsi"
              value={loading ? "..." : totalProvinces.toString()}
              description="Seluruh Indonesia"
              icon={MapPin}
            />
            <StatCard
              title="Cabang"
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
              <h2 className="text-3xl font-bold heading-medical">Cari Anggota PDPI</h2>
              <p className="text-lg text-medical-body">
                Temukan dokter spesialis paru berdasarkan nama, rumah sakit, atau lokasi
              </p>
            </div>

            {/* Hero Search Bar */}
            <div className="space-y-6">
              <SearchBar size="hero" className="max-w-2xl mx-auto" />

              {/* Province Quick Chips */}
              <div className="max-w-2xl mx-auto">
                <ProvinceChips />
              </div>
            </div>
          </div>
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
                Gunakan filter provinsi, cabang, atau kota untuk mempersempit hasil pencarian
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

      {/* Data Source Note */}
      <section className="section-spacing bg-muted/20">
        <div className="container-pdpi">
          <div className="card-glass p-6 max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold heading-medical mb-3">Sumber Data</h3>
            <p className="text-medical-body">
              Data anggota ini dikelola oleh Pengurus Pusat PDPI dan diperbarui secara berkala. Untuk informasi lebih
              lanjut atau koreksi data, silakan hubungi sekretariat PDPI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
