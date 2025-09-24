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
      // First, try to find member by email
      let { data: existingMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingMember) {
        // Member found - sync auth data with member data
        const updatedData: Partial<Member> = {};
        let hasUpdates = false;

        // Sync email if different
        if (existingMember.email !== user.email) {
          updatedData.email = user.email || '';
          hasUpdates = true;
        }

        // Extract metadata from user if available
        const userMetadata = user.user_metadata;
        if (userMetadata) {
          // Sync birth date
          if (userMetadata.tgl_lahir && existingMember.tgl_lahir !== userMetadata.tgl_lahir) {
            updatedData.tgl_lahir = userMetadata.tgl_lahir;
            hasUpdates = true;
          }

          // Sync birth place
          if (userMetadata.tempat_lahir && existingMember.tempat_lahir !== userMetadata.tempat_lahir) {
            updatedData.tempat_lahir = userMetadata.tempat_lahir;
            hasUpdates = true;
          }

          // Sync gender
          if (userMetadata.jenis_kelamin && existingMember.jenis_kelamin !== userMetadata.jenis_kelamin) {
            updatedData.jenis_kelamin = userMetadata.jenis_kelamin;
            hasUpdates = true;
          }

          // Sync phone number
          if (userMetadata.no_hp && existingMember.no_hp !== userMetadata.no_hp) {
            updatedData.no_hp = userMetadata.no_hp;
            hasUpdates = true;
          }

          // Sync full address
          if (userMetadata.alamat_rumah && existingMember.alamat_rumah !== userMetadata.alamat_rumah) {
            updatedData.alamat_rumah = userMetadata.alamat_rumah;
            hasUpdates = true;
          }

          // Sync name if available and different
          if (userMetadata.nama && existingMember.nama !== userMetadata.nama) {
            updatedData.nama = userMetadata.nama;
            hasUpdates = true;
          }
        }

        // Update member data if there are changes
        if (hasUpdates) {
          const { data: updatedMember, error: updateError } = await supabase
            .from('members')
            .update(updatedData)
            .eq('id', existingMember.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          setMember(updatedMember as Member);
          
          toast({
            title: "Data Tersinkronisasi",
            description: "Data anggota telah diperbarui dengan informasi login terbaru.",
          });
        } else {
          setMember(existingMember as Member);
        }

        setSyncStatus('synced');
      } else {
        // No member found with this email
        setMember(null);
        setSyncStatus('idle');
        
        console.log('No member record found for email:', user.email);
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
