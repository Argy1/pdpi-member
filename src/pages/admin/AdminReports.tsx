import { useMemberContext } from '@/contexts/MemberContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Download,
  Filter,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

export default function AdminReports() {
  const { members } = useMemberContext();
  const { profile, isPusatAdmin } = useAuth();

  // Calculate comprehensive statistics
  const reportData = useMemo(() => {
    console.log('Generating report data from', members.length, 'members');

    // Status distribution
    const statusDistribution = [
      { name: 'Aktif', value: members.filter(m => m.status === 'AKTIF').length, color: '#10b981' },
      { name: 'Pending', value: members.filter(m => m.status === 'PENDING').length, color: '#f59e0b' },
      { name: 'Tidak Aktif', value: members.filter(m => m.status === 'TIDAK_AKTIF').length, color: '#ef4444' }
    ];

    // Province distribution (top 10)
    const provinceCount = members.reduce((acc, member) => {
      const provinsi = member.provinsi || 'Tidak Diketahui';
      acc[provinsi] = (acc[provinsi] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const provinceDistribution = Object.entries(provinceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Specialization distribution
    const spesialisCount = members.reduce((acc, member) => {
      const spesialis = member.spesialis || 'Tidak Diketahui';
      acc[spesialis] = (acc[spesialis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const spesialisDistribution = Object.entries(spesialisCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Gender distribution
    const genderDistribution = [
      { name: 'Laki-laki', value: members.filter(m => m.jenisKelamin === 'L').length },
      { name: 'Perempuan', value: members.filter(m => m.jenisKelamin === 'P').length },
      { name: 'Tidak Diketahui', value: members.filter(m => !m.jenisKelamin).length }
    ];

    // Registration trend (mock data for demonstration)
    const registrationTrend = [
      { month: 'Jan', members: Math.floor(members.length * 0.08) },
      { month: 'Feb', members: Math.floor(members.length * 0.12) },
      { month: 'Mar', members: Math.floor(members.length * 0.15) },
      { month: 'Apr', members: Math.floor(members.length * 0.18) },
      { month: 'May', members: Math.floor(members.length * 0.22) },
      { month: 'Jun', members: Math.floor(members.length * 0.25) }
    ];

    return {
      statusDistribution,
      provinceDistribution,
      spesialisDistribution,
      genderDistribution,
      registrationTrend
    };
  }, [members]);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'AKTIF').length;
  const pendingMembers = members.filter(m => m.status === 'PENDING').length;
  const inactiveMembers = members.filter(m => m.status === 'TIDAK_AKTIF').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan & Statistik</h1>
          <p className="text-muted-foreground">
            Analisis data keanggotaan PDPI secara komprehensif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Semua anggota terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMembers.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">
              {totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingMembers.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Memerlukan review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveMembers.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Anggota non-aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Anggota</CardTitle>
            <CardDescription>Perbandingan status keanggotaan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Kelamin</CardTitle>
            <CardDescription>Perbandingan anggota berdasarkan gender</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.genderDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Province Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Provinsi</CardTitle>
            <CardDescription>Anggota berdasarkan provinsi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.provinceDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Spesialisasi</CardTitle>
            <CardDescription>Top 5 spesialisasi anggota</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.spesialisDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.spesialisDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Pendaftaran</CardTitle>
          <CardDescription>Jumlah anggota baru per bulan (data simulasi)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="members" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistik Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rata-rata per provinsi</span>
              <Badge variant="secondary">
                {reportData.provinceDistribution.length > 0 ? 
                  Math.round(totalMembers / reportData.provinceDistribution.length) : 0
                } anggota
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Spesialisasi terbanyak</span>
              <Badge variant="outline">
                {reportData.spesialisDistribution[0]?.name || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Provinsi terbanyak</span>
              <Badge variant="outline">
                {reportData.provinceDistribution[0]?.name || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tingkat Aktivitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tingkat Aktif</span>
                <span>{totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending Review</span>
                <span>{totalMembers > 0 ? ((pendingMembers / totalMembers) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${totalMembers > 0 ? (pendingMembers / totalMembers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Diperlukan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMembers > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    {pendingMembers} Pending
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Memerlukan persetujuan
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            )}
            <div className="text-sm text-muted-foreground text-center py-4">
              {pendingMembers === 0 ? 'Semua anggota sudah disetujui' : 'Ada item yang memerlukan review'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}