import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, FileText, RefreshCcw, BarChart3, ArrowLeft } from 'lucide-react';
import AdminIuranRingkasan from './tabs/AdminIuranRingkasan';
import AdminIuranBayarMewakili from './tabs/AdminIuranBayarMewakili';
import AdminIuranKelolaTagihan from './tabs/AdminIuranKelolaTagihan';
import AdminIuranRekonsiliasi from './tabs/AdminIuranRekonsiliasi';
import AdminIuranLaporan from './tabs/AdminIuranLaporan';

export default function AdminIuranLayout() {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')} 
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Admin Iuran</h1>
        <p className="text-muted-foreground">Kelola pembayaran iuran anggota PDPI</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="ringkasan" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="bayar-mewakili" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Bayar Mewakili</span>
          </TabsTrigger>
          <TabsTrigger value="kelola-tagihan" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Kelola Tagihan</span>
          </TabsTrigger>
          <TabsTrigger value="rekonsiliasi" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Rekonsiliasi</span>
          </TabsTrigger>
          <TabsTrigger value="laporan" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Laporan</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="ringkasan" className="mt-0">
            <AdminIuranRingkasan />
          </TabsContent>

          <TabsContent value="bayar-mewakili" className="mt-0">
            <AdminIuranBayarMewakili />
          </TabsContent>

          <TabsContent value="kelola-tagihan" className="mt-0">
            <AdminIuranKelolaTagihan />
          </TabsContent>

          <TabsContent value="rekonsiliasi" className="mt-0">
            <AdminIuranRekonsiliasi />
          </TabsContent>

          <TabsContent value="laporan" className="mt-0">
            <AdminIuranLaporan />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
