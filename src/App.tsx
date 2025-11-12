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
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMemberForm from "./pages/admin/AdminMemberForm";
import AdminMemberDetail from "./pages/admin/AdminMemberDetail";
import AdminImport from "./pages/admin/AdminImport";
import AdminReports from "./pages/admin/AdminReports";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminChangeRequests from "./pages/admin/AdminChangeRequests";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
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
              <Route path="/login" element={<LoginPage />} />
              
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
                {/* Add more admin routes as needed */}
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
