import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { MemberProvider } from "@/contexts/MemberContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Homepage from "./pages/Homepage";
import AnggotaPage from "./pages/AnggotaPage";
import SebaranPage from "./pages/SebaranPage";
import BankDataPage from "./pages/BankDataPage";
import LoginPage from "./pages/LoginPage";
import RegistrasiPage from "./pages/RegistrasiPage";
import ProfilPage from "./pages/ProfilPage";
import ProfilEditPage from "./pages/ProfilEditPage";
import ProfilSayaPage from "./pages/ProfilSayaPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMemberForm from "./pages/admin/AdminMemberForm";
import AdminMemberDetail from "./pages/admin/AdminMemberDetail";
import AdminImport from "./pages/admin/AdminImport";
import AdminReports from "./pages/admin/AdminReports";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminChangeRequests from "./pages/admin/AdminChangeRequests";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import IuranSaya from "./pages/iuran/IuranSaya";
import PembayaranKolektif from "./pages/iuran/PembayaranKolektif";
import Checkout from "./pages/iuran/Checkout";
import InstruksiPembayaran from "./pages/iuran/InstruksiPembayaran";
import RiwayatPembayaran from "./pages/iuran/RiwayatPembayaran";
import InvoiceDetail from "./pages/invoice/InvoiceDetail";
import AdminIuranLayout from "./pages/admin/iuran/AdminIuranLayout";
import AdminPeriodeTarif from "./pages/admin/iuran/AdminPeriodeTarif";
import AdminKelolaTagihan from "./pages/admin/iuran/AdminKelolaTagihan";
import AdminRekonsiliasi from "./pages/admin/iuran/AdminRekonsiliasi";
import AdminLaporan from "./pages/admin/iuran/AdminLaporan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="pdpi-theme">
      <AuthProvider>
        <MemberProvider>
          <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Homepage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/anggota" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <AnggotaPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/sebaran" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <SebaranPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/bank-data" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <BankDataPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registrasi" element={<RegistrasiPage />} />
              <Route path="/profil-saya" element={<ProfilSayaPage />} />
              <Route path="/profil" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <ProfilPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/profil/edit" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <ProfilEditPage />
                  </main>
                  <Footer />
                </div>
              } />
              
              {/* Iuran routes (Member) */}
              <Route path="/iuran" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <IuranSaya />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iuran/kolektif" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <PembayaranKolektif />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iuran/checkout" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Checkout />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iuran/instruksi/:groupCode" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <InstruksiPembayaran />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iuran/riwayat" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <RiwayatPembayaran />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/invoice/:groupCode" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <InvoiceDetail />
                  </main>
                  <Footer />
                </div>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="anggota" element={<AdminMembers />} />
                <Route path="anggota/new" element={<AdminMemberForm />} />
                <Route path="anggota/:id" element={<AdminMemberDetail />} />
                <Route path="anggota/:id/edit" element={<AdminMemberForm />} />
                <Route path="usulan-perubahan" element={<AdminChangeRequests />} />
                <Route path="audit-log" element={<AdminAuditLog />} />
                <Route path="import" element={<AdminImport />} />
                <Route path="laporan" element={<AdminReports />} />
                <Route path="profil" element={<AdminProfile />} />
                
                {/* Admin Iuran routes */}
                <Route path="iuran" element={<AdminIuranLayout />} />
                <Route path="iuran/periode" element={<AdminPeriodeTarif />} />
                <Route path="iuran/tagihan" element={<AdminKelolaTagihan />} />
                <Route path="iuran/rekonsiliasi" element={<AdminRekonsiliasi />} />
                <Route path="iuran/laporan" element={<AdminLaporan />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
          </TooltipProvider>
        </MemberProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
