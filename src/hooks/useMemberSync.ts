import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/member';
import { useToast } from '@/hooks/use-toast';

interface MemberSyncResult {
  member: Member | null;
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

export function useMemberSync(): MemberSyncResult {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    if (user && session) {
      syncMemberData();
    } else {
      setMember(null);
      setSyncStatus('idle');
    }
  }, [user, session]);

  const syncMemberData = async () => {
    if (!user || !session) return;

    setLoading(true);
    setSyncStatus('syncing');
    setError(null);

    try {
      // Get NIK from profiles or user metadata (check both 'nik' and 'name' fields)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nik')
        .eq('user_id', user.id)
        .maybeSingle();

      const typedProfile = profileData as any;
      let nik = typedProfile?.nik || user.user_metadata?.nik || user.user_metadata?.name;
      
      // Validate NIK format (16 digits)
      if (nik && !/^\d{16}$/.test(nik)) {
        nik = null; // Invalid format
      }

      if (!nik) {
        setError('NIK tidak ditemukan');
        setSyncStatus('idle');
        console.log('No valid NIK found in profile or metadata');
        setLoading(false);
        return;
      }

      // Find member by NIK only (ignore email)
      const { data: existingMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('nik', nik)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingMember) {
        // Member found - just set the member data
        setMember(existingMember as Member);
        
        setSyncStatus('synced');
      } else {
        // No member found with this NIK
        setMember(null);
        setSyncStatus('idle');
        
        console.log('No member record found for NIK:', nik);
      }
    } catch (err) {
      console.error('Error syncing member data:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat sinkronisasi data');
      setSyncStatus('error');
      
      toast({
        title: "Gagal Sinkronisasi",
        description: "Tidak dapat menyinkronkan data anggota. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberMetadata = async (memberData: Partial<Member>) => {
    if (!user || !member) return;

    try {
      // Update auth user metadata to keep it in sync
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          nama: memberData.nama,
          tgl_lahir: memberData.tgl_lahir,
          tempat_lahir: memberData.tempat_lahir,
          jenis_kelamin: memberData.jenis_kelamin,
          no_hp: memberData.no_hp,
          alamat_rumah: memberData.alamat_rumah,
        }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }
    } catch (err) {
      console.error('Error updating member metadata:', err);
    }
  };

  return {
    member,
    loading,
    error,
    syncStatus
  };
}
