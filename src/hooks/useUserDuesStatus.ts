import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserDuesStatus {
  hasPaidDues: boolean;
  loading: boolean;
  memberData: {
    id: string;
    nama: string;
    npa: string | null;
  } | null;
  paidYears: number[];
}

export const useUserDuesStatus = () => {
  const { user, profile, loading: authLoading, isPusatAdmin, isCabangAdmin } = useAuth();
  const [hasPaidDues, setHasPaidDues] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<UserDuesStatus['memberData']>(null);
  const [paidYears, setPaidYears] = useState<number[]>([]);

  useEffect(() => {
    const checkDuesStatus = async () => {
      // If still loading auth, wait
      if (authLoading) {
        return;
      }

      // If not logged in, no dues
      if (!user || !profile) {
        setHasPaidDues(false);
        setLoading(false);
        return;
      }

      // Admin pusat and admin cabang always have access
      if (isPusatAdmin || isCabangAdmin) {
        setHasPaidDues(true);
        setLoading(false);
        return;
      }

      try {
        // Get NIK from profile
        const userNik = profile.nik;
        
        if (!userNik) {
          console.log('User has no NIK in profile');
          setHasPaidDues(false);
          setLoading(false);
          return;
        }

        // Find member by NIK
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id, nama, npa')
          .eq('nik', userNik)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching member:', memberError);
          setHasPaidDues(false);
          setLoading(false);
          return;
        }

        if (!member) {
          console.log('No member found with NIK:', userNik);
          setHasPaidDues(false);
          setLoading(false);
          return;
        }

        setMemberData({
          id: member.id,
          nama: member.nama,
          npa: member.npa,
        });

        // Check if member has paid dues (any year with PAID status)
        const { data: duesData, error: duesError } = await supabase
          .from('member_dues')
          .select('year, status')
          .eq('member_id', member.id)
          .eq('status', 'PAID');

        if (duesError) {
          console.error('Error fetching dues:', duesError);
          setHasPaidDues(false);
          setLoading(false);
          return;
        }

        const paidYearsList = duesData?.map(d => d.year) || [];
        setPaidYears(paidYearsList);

        // User has paid if they have at least one PAID dues record
        const hasPaid = paidYearsList.length > 0;
        setHasPaidDues(hasPaid);
        
        console.log('User dues status:', { 
          memberId: member.id, 
          hasPaid, 
          paidYears: paidYearsList 
        });

      } catch (error) {
        console.error('Error checking dues status:', error);
        setHasPaidDues(false);
      } finally {
        setLoading(false);
      }
    };

    checkDuesStatus();
  }, [user, profile, authLoading, isPusatAdmin, isCabangAdmin]);

  return {
    hasPaidDues,
    loading: loading || authLoading,
    memberData,
    paidYears,
    isAdmin: isPusatAdmin || isCabangAdmin,
  };
};
