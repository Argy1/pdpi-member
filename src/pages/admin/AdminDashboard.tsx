import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Building, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalBranches: number;
}

export default function AdminDashboard() {
  const { profile, isPusatAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    totalBranches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, using mock data
      // In real implementation, you would query your members table
      // with proper filtering based on user role and branch
      
      let mockStats = {
        totalMembers: 1250,
        activeMembers: 1180,
        pendingMembers: 70,
        totalBranches: 34
      };

      // If cabang admin, show limited stats for their branch only
      if (profile?.role === 'ADMIN_CABANG') {
        mockStats = {
          totalMembers: 45,
          activeMembers: 42,
          pendingMembers: 3,
          totalBranches: 1
        };
      }

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Anggota',
      value: stats.totalMembers,
      description: 'Semua anggota terdaftar',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Anggota Aktif',
      value: stats.activeMembers,
      description: 'Anggota dengan status aktif',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Menunggu Persetujuan',
      value: stats.pendingMembers,
      description: 'Pendaftaran baru',
      icon: UserPlus,
      color: 'text-orange-600'
    },
  ];

  // Add branch stats for pusat admin
  if (isPusatAdmin) {
    statCards.push({
      title: 'Total Cabang',
      value: stats.totalBranches,
      description: 'Cabang PDPI aktif',
      icon: Building,
      color: 'text-purple-600'
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Selamat datang di panel administrasi PDPI Directory
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  card.value.toLocaleString('id-ID')
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Daftar aktivitas administrasi terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Anggota baru terdaftar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item} jam yang lalu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tugas Menunggu</CardTitle>
            <CardDescription>
              Item yang memerlukan persetujuan atau tindakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Persetujuan pendaftaran baru
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingMembers} item menunggu
                  </p>
                </div>
                <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  Menunggu
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Update data anggota
                  </p>
                  <p className="text-xs text-muted-foreground">
                    5 item menunggu review
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Review
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}