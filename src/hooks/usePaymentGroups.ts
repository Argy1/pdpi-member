import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentGroup {
  id: string;
  group_code: string;
  created_by: string;
  method: 'qris' | 'bank_transfer';
  amount_base: number;
  unique_code: number;
  total_payable: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';
  expired_at: string | null;
  paid_at: string | null;
  transfer_proof_url: string | null;
  note: string | null;
  created_at: string;
}

export const usePaymentGroups = () => {
  const [paymentGroups, setPaymentGroups] = useState<PaymentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPaymentGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentGroups((data as any) || []);
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

  useEffect(() => {
    fetchPaymentGroups();
  }, []);

  return { paymentGroups, loading, refetch: fetchPaymentGroups };
};
