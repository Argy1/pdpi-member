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

      // Fetch ALL members dengan status Biasa menggunakan pagination
      // Supabase default limit adalah 1000, jadi kita perlu fetch semua dengan range
      const pageSize = 1000;
      let allMembers: any[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error: batchError } = await supabase
          .from('members')
          .select('id, npa, nama, cabang, status, email, no_hp')
          .eq('status', 'Biasa')
          .order('nama')
          .range(from, from + pageSize - 1);

        if (batchError) {
          console.error('Error fetching members batch:', batchError);
          throw batchError;
        }

        if (batch && batch.length > 0) {
          allMembers = [...allMembers, ...batch];
          from += pageSize;
          hasMore = batch.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      const membersData = allMembers;
      const membersError = null;

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      if (!membersData || membersData.length === 0) {
        console.log('No members data found');
        setMembers([]);
        setStats({ total: 0, paid: 0, unpaid: 0 });
        setLoading(false);
        return;
      }

      console.log('Fetched members:', membersData.length);

      // Filter by branch for admin_cabang on client side
      let filteredMembers = membersData;
      if (isAdminCabang && branchId) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branchId)
          .single();
        
        if (branchData?.name) {
          filteredMembers = membersData.filter(m => m.cabang === branchData.name);
          console.log('Filtered by branch:', branchData.name, filteredMembers.length);
        }
      }

      // Fetch payment status untuk tahun yang dipilih
      const { data: duesData, error: duesError } = await supabase
        .from('member_dues')
        .select('member_id, status, paid_at')
        .eq('year', year);

      if (duesError) {
        console.error('Error fetching dues:', duesError);
        // Don't throw, just continue with empty dues
      }

      console.log('Fetched dues for year', year, ':', duesData?.length || 0);

      // Map payment status ke members
      const duesMap = new Map(
        (duesData || []).map(due => [due.member_id, { status: due.status, paid_at: due.paid_at }])
      );

      const membersWithStatus: MemberPaymentStatus[] = filteredMembers.map(member => {
        const dueInfo = duesMap.get(member.id);
        return {
          ...member,
          payment_status: (dueInfo?.status === 'PAID' ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
          paid_at: dueInfo?.paid_at || null,
        };
      });

      console.log('Members with payment status:', membersWithStatus.length);

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
        description: error.message || 'Gagal memuat status pembayaran anggota',
        variant: 'destructive',
      });
      setMembers([]);
      setStats({ total: 0, paid: 0, unpaid: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberPaymentStatus();
  }, [year, branchId]);

  return {
    members,
    loading,
    stats,
    refetch: fetchMemberPaymentStatus,
  };
};
