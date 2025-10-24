import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Building,
  CheckCircle,
  Settings,
  FileText,
  BarChart3,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStats } from "@/hooks/useStats";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalBranches: number;
}

export default function AdminDashboard() {
  const { isPusatAdmin } = useAuth();

  // Use Stats API to get accurate total from database
  const { summary, loading, error } = useStats({});

  // Calculate real-time statistics from summary data
  const stats = useMemo<DashboardStats>(() => {
    if (!summary) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingMembers: 0,
        totalBranches: 0,
      };
    }

    // Total members from summary
    const totalMembers = summary.total;
    
    // For active/pending, we'll use estimated percentages or fetch separately
    // For now, using total as active (you can modify this logic)
    const activeMembers = totalMembers;
    const pendingMembers = 0;
    
    // Total branches from summary
    const totalBranches = summary.byCabang.length;

    return {
      totalMembers,
      activeMembers,
      pendingMembers,
      totalBranches,
    };
  }, [summary]);

  const statCards = [
    {
      title: "Total Anggota",
      value: stats.totalMembers,
      description: "Semua anggota terdaftar",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Anggota Aktif",
      value: stats.activeMembers,
      description: "Anggota dengan status aktif",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Menunggu Persetujuan",
      value: stats.pendingMembers,
      description: "Pendaftaran baru",
      icon: UserPlus,
      color: "text-orange-600",
    },
  ];

  // Add branch stats for pusat admin
  if (isPusatAdmin) {
    statCards.push({
      title: "Total Cabang",
      value: stats.totalBranches,
      description: "Cabang PDPI aktif",
      icon: Building,
      color: "text-purple-600",
    });
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Home
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang di panel administrasi PDPI Directory</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  card.value.toLocaleString("id-ID")
                )}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Akses Cepat</h2>
          <p className="text-muted-foreground text-sm">Navigasi cepat ke fitur administrasi utama</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Manajemen Anggota</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kelola data anggota, tambah anggota baru, dan update informasi
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link to="/admin/anggota">Kelola Anggota</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Laporan & Statistik</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Lihat laporan keanggotaan dan statistik data</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link to="/admin/laporan">Lihat Laporan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Pengaturan Sistem</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Konfigurasi sistem dan pengaturan admin</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" disabled>
                  Segera Tersedia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Daftar aktivitas administrasi terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Anggota baru terdaftar</p>
                    <p className="text-xs text-muted-foreground">{item} jam yang lalu</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tugas Menunggu</CardTitle>
            <CardDescription>Item yang memerlukan persetujuan atau tindakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Persetujuan pendaftaran baru</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingMembers} item menunggu</p>
                </div>
                <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Menunggu</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Update data anggota</p>
                  <p className="text-xs text-muted-foreground">5 item menunggu review</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
