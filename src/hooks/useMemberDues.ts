import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MemberDue {
  id: string;
  member_id: string;
  npa: string;
  year: number;
  status: 'PAID' | 'UNPAID';
  paid_at: string | null;
}

export const useMemberDues = (memberId?: string) => {
  const [dues, setDues] = useState<MemberDue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDues = async () => {
    try {
      setLoading(true);
      let query = supabase.from('member_dues').select('*');
      
      if (memberId) {
        query = query.eq('member_id', memberId);
      }

      const { data, error } = await query.order('year', { ascending: false });

      if (error) throw error;
      setDues((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isPaidYear = (year: number): boolean => {
    return dues.some(d => d.year === year && d.status === 'PAID');
  };

  useEffect(() => {
    fetchDues();
  }, [memberId]);

  return { dues, loading, refetch: fetchDues, isPaidYear };
};
