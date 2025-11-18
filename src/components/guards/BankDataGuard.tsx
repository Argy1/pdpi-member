import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface BankDataGuardProps {
  children: React.ReactNode;
}

export const BankDataGuard = ({ children }: BankDataGuardProps) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && profile?.role === 'user') {
      toast({
        title: 'Akses Ditolak',
        description: 'Akses khusus admin Bank Data.',
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

  // Only admin_pusat and admin_cabang can access
  if (profile?.role === 'user') {
    return <Navigate to="/bank-data" replace />;
  }

  return <>{children}</>;
};
