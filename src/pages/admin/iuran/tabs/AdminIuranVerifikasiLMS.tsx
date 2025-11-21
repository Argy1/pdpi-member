import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
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

export default function AdminIuranVerifikasiLMS() {
  const { toast } = useToast();
  const { isAdminPusat, branchId, loading: authLoading } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [paidMembers, setPaidMembers] = useState<PaidMemberData[]>([]);
  
  // Filters
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [pdFilter, setPdFilter] = useState('all');
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchBranches();
      fetchPaidMembers();
    }
  }, [authLoading, branchId, isAdminPusat, yearFilter, pdFilter]);

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

      // Filter by branch for admin_cabang
      if (!isAdminPusat && branchId) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branchId)
          .single();
        
        if (branchData?.name) {
          filteredData = filteredData.filter(d => d.cabang === branchData.name);
        }
      } else if (pdFilter !== 'all') {
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
      const exportData = paidMembers.map(member => ({
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
      const exportData = paidMembers.map(member => ({
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verifikasi LMS Otomatis</CardTitle>
              <CardDescription>
                Data anggota yang sudah membayar iuran untuk verifikasi LMS
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={paidMembers.length === 0}
                className="gap-2 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={exportToXLSX}
                disabled={paidMembers.length === 0}
                className="gap-2 w-full sm:w-auto"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Export XLSX</span>
                <span className="sm:hidden">XLSX</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Tahun</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdminPusat && (
              <div>
                <label className="text-sm font-medium mb-2 block">PD</label>
                <Select value={pdFilter} onValueChange={setPdFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua PD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua PD</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-primary/5 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Anggota yang Sudah Membayar</p>
                <p className="text-xs text-muted-foreground">Tahun {yearFilter}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">{paidMembers.length}</p>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paidMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada anggota yang membayar dengan filter ini</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nomor HP</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>NPA</TableHead>
                      <TableHead>Cabang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidMembers.map((member, index) => (
                      <TableRow key={`${member.nik}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{member.no_hp}</TableCell>
                        <TableCell className="font-medium">{member.nama}</TableCell>
                        <TableCell>{member.nik}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.npa}</TableCell>
                        <TableCell>{member.cabang}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paidMembers.map((member, index) => (
                  <Card key={`${member.nik}-${index}`} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-lg">{index + 1}</div>
                        <Badge variant="outline">{member.cabang}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Nama</p>
                          <p className="font-medium">{member.nama}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">NPA</p>
                            <p className="font-medium">{member.npa}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">NIK</p>
                            <p className="font-medium text-xs">{member.nik}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-sm break-all">{member.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nomor HP</p>
                          <p className="font-medium">{member.no_hp}</p>
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
