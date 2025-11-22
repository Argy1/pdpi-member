import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface VerifikasiLMSGuardProps {
  children: React.ReactNode;
}

export const VerifikasiLMSGuard = ({ children }: VerifikasiLMSGuardProps) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && profile?.role !== 'admin_pusat') {
      toast({
        title: 'Akses Ditolak',
        description: 'Halaman Verifikasi LMS hanya dapat diakses oleh Admin Pusat.',
        variant: 'destructive',
      });
    }
  }, [loading, user, profile, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only admin_pusat can access Verifikasi LMS
  if (profile?.role !== 'admin_pusat') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
