import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, FileSpreadsheet, FileText, CheckCircle, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface PaidMemberData {
  no_hp: string;
  nama: string;
  nik: string;
  email: string;
  npa: string;
  cabang: string;
  year: number;
}

export default function AdminVerifikasiLMS() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paidMembers, setPaidMembers] = useState<PaidMemberData[]>([]);
  
  // Filters
  const [yearFilter, setYearFilter] = useState('2026');
  const [pdFilter, setPdFilter] = useState('all');
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetchBranches();
    fetchPaidMembers();
  }, [yearFilter, pdFilter]);

  const fetchBranches = async () => {
    try {
      const { data } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      setBranches(data || []);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchPaidMembers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('member_dues')
        .select(`
          year,
          members(
            no_hp,
            nama,
            nik,
            email,
            npa,
            cabang
          )
        `)
        .eq('status', 'PAID')
        .eq('year', parseInt(yearFilter))
        .order('paid_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let filteredData: PaidMemberData[] = (data || [])
        .filter(d => d.members)
        .map(d => ({
          no_hp: (d.members as any)?.no_hp || '-',
          nama: (d.members as any)?.nama || '-',
          nik: (d.members as any)?.nik || '-',
          email: (d.members as any)?.email || '-',
          npa: (d.members as any)?.npa || '-',
          cabang: (d.members as any)?.cabang || '-',
          year: d.year
        }));

      // Filter by branch if selected
      if (pdFilter !== 'all') {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', pdFilter)
          .single();
        
        if (branchData?.name) {
          filteredData = filteredData.filter(d => d.cabang === branchData.name);
        }
      }

      // Remove duplicates based on NIK
      const uniqueMembers = filteredData.reduce((acc, current) => {
        const exists = acc.find(item => item.nik === current.nik);
        if (!exists) {
          return [...acc, current];
        }
        return acc;
      }, [] as PaidMemberData[]);

      setPaidMembers(uniqueMembers);
    } catch (error: any) {
      console.error('Error fetching paid members:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data anggota yang sudah membayar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToXLSX = () => {
    try {
      const exportData = paidMembers.map((member, index) => ({
        'No': index + 1,
        'Nomor HP': member.no_hp,
        'Nama': member.nama,
        'NIK': member.nik,
        'Email': member.email,
        'NPA': member.npa,
        'Cabang': member.cabang,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Verifikasi LMS');
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 15 }, // Nomor HP
        { wch: 30 }, // Nama
        { wch: 20 }, // NIK
        { wch: 30 }, // Email
        { wch: 12 }, // NPA
        { wch: 25 }, // Cabang
      ];

      const fileName = `Verifikasi_LMS_${yearFilter}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Berhasil',
        description: `Data berhasil diekspor ke ${fileName}`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    try {
      const exportData = paidMembers.map((member, index) => ({
        'No': index + 1,
        'Nomor HP': member.no_hp,
        'Nama': member.nama,
        'NIK': member.nik,
        'Email': member.email,
        'NPA': member.npa,
        'Cabang': member.cabang,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `Verifikasi_LMS_${yearFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Berhasil',
        description: `Data berhasil diekspor ke ${fileName}`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Verifikasi LMS</h1>
              <p className="text-teal-100">Data anggota terverifikasi untuk Learning Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Users className="h-3 w-3 mr-1" />
              Admin Pusat Only
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              Tahun {yearFilter}
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Data Anggota Terverifikasi</CardTitle>
              <CardDescription className="text-base mt-1">
                Daftar anggota yang telah membayar iuran dan terverifikasi untuk akses LMS
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={paidMembers.length === 0 || loading}
                className="gap-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 dark:border-teal-800 dark:hover:bg-teal-950"
              >
                <FileText className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={exportToXLSX}
                disabled={paidMembers.length === 0 || loading}
                className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export XLSX</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Iuran</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => 2026 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter Cabang (PD)</label>
              <Select value={pdFilter} onValueChange={setPdFilter}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Semua PD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl p-6 mb-6 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Anggota Terverifikasi</p>
                  <p className="text-lg font-semibold text-teal-700 dark:text-teal-400">Tahun {yearFilter}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{paidMembers.length}</p>
                <p className="text-sm text-muted-foreground">Anggota</p>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Memuat data anggota...</p>
              </div>
            </div>
          ) : paidMembers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed">
              <Download className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Belum ada data</p>
              <p className="text-sm mt-1">Belum ada anggota yang membayar dengan filter yang dipilih</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableHead className="font-semibold">No</TableHead>
                      <TableHead className="font-semibold">Nomor HP</TableHead>
                      <TableHead className="font-semibold">Nama Lengkap</TableHead>
                      <TableHead className="font-semibold">NIK</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">NPA</TableHead>
                      <TableHead className="font-semibold">Cabang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidMembers.map((member, index) => (
                      <TableRow key={`${member.nik}-${index}`} className="hover:bg-teal-50/50 dark:hover:bg-teal-950/20">
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono">{member.no_hp}</TableCell>
                        <TableCell className="font-medium">{member.nama}</TableCell>
                        <TableCell className="font-mono text-sm">{member.nik}</TableCell>
                        <TableCell className="text-sm">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">{member.npa}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800">
                            {member.cabang}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paidMembers.map((member, index) => (
                  <Card key={`${member.nik}-${index}`} className="border-l-4 border-l-teal-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="text-lg px-3 py-1">#{index + 1}</Badge>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800">
                          {member.cabang}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="pb-2 border-b">
                          <p className="text-xs text-muted-foreground mb-1">Nama Lengkap</p>
                          <p className="font-semibold text-lg">{member.nama}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">NPA</p>
                            <Badge variant="secondary" className="font-mono">{member.npa}</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">NIK</p>
                            <p className="font-mono text-sm">{member.nik}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="text-sm break-all">{member.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Nomor HP</p>
                          <p className="font-mono font-medium">{member.no_hp}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
