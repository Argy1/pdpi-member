import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { MemberProfileSync } from '@/components/admin/MemberProfileSync';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminProfile() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container-pdpi py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold heading-medical">Profil Saya</h1>
            <p className="text-medical-body">
              Kelola informasi profil anggota yang tersinkronisasi dengan akun login Anda.
            </p>
          </div>

          <MemberProfileSync />
        </div>
      </div>
    </div>
  );
}