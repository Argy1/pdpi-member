import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminProfile {
  user_id: string;
  role: 'admin_pusat' | 'admin_cabang';
  branch_id: string | null;
  branches?: {
    id: string;
    name: string;
  };
}

export const useAdminAccess = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          role,
          branch_id,
          branches(id, name)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as any);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat profil admin',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdminPusat = profile?.role === 'admin_pusat';
  const isAdminCabang = profile?.role === 'admin_cabang';
  const hasAccess = isAdminPusat || isAdminCabang;

  return {
    profile,
    loading,
    isAdminPusat,
    isAdminCabang,
    hasAccess,
    branchId: profile?.branch_id,
    branchName: profile?.branches?.name
  };
};
