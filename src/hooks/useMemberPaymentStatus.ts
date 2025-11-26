import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from './useAdminAccess';

export interface MemberPaymentStatus {
  id: string;
  npa: string;
  nama: string;
  cabang: string | null;
  status: string | null;
  email: string | null;
  no_hp: string | null;
  payment_status: 'PAID' | 'UNPAID';
  paid_at: string | null;
}

export const useMemberPaymentStatus = (year: number) => {
  const [members, setMembers] = useState<MemberPaymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });
  const { toast } = useToast();
  const { isAdminPusat, isAdminCabang, branchId } = useAdminAccess();

  const fetchMemberPaymentStatus = async () => {
    try {
      setLoading(true);

      // Fetch members dengan status AKTIF
      let membersQuery = supabase
        .from('members')
        .select('id, npa, nama, cabang, status, email, no_hp')
        .eq('status', 'AKTIF')
        .order('nama');

      // Filter by branch for admin_cabang
      if (isAdminCabang && branchId) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branchId)
          .single();
        
        if (branchData?.name) {
          membersQuery = membersQuery.eq('cabang', branchData.name);
        }
      }

      const { data: membersData, error: membersError } = await membersQuery;

      if (membersError) throw membersError;

      if (!membersData) {
        setMembers([]);
        setStats({ total: 0, paid: 0, unpaid: 0 });
        return;
      }

      // Fetch payment status untuk tahun yang dipilih
      const { data: duesData, error: duesError } = await supabase
        .from('member_dues')
        .select('member_id, status, paid_at')
        .eq('year', year);

      if (duesError) throw duesError;

      // Map payment status ke members
      const duesMap = new Map(
        (duesData || []).map(due => [due.member_id, { status: due.status, paid_at: due.paid_at }])
      );

      const membersWithStatus: MemberPaymentStatus[] = membersData.map(member => {
        const dueInfo = duesMap.get(member.id);
        return {
          ...member,
          payment_status: (dueInfo?.status === 'PAID' ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
          paid_at: dueInfo?.paid_at || null,
        };
      });

      setMembers(membersWithStatus);

      // Calculate statistics
      const paidCount = membersWithStatus.filter(m => m.payment_status === 'PAID').length;
      const unpaidCount = membersWithStatus.filter(m => m.payment_status === 'UNPAID').length;

      setStats({
        total: membersWithStatus.length,
        paid: paidCount,
        unpaid: unpaidCount,
      });
    } catch (error: any) {
      console.error('Error fetching member payment status:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat status pembayaran anggota',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminPusat || isAdminCabang) {
      fetchMemberPaymentStatus();
    }
  }, [year, isAdminPusat, isAdminCabang, branchId]);

  return {
    members,
    loading,
    stats,
    refetch: fetchMemberPaymentStatus,
  };
};
