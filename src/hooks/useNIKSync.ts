import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to sync NIK from user metadata to profiles table
 * Runs once on mount when user is logged in
 */
export function useNIKSync() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const syncNIK = async () => {
      if (!user) return;

      // Skip if profile already has NIK
      const typedProfile = profile as any;
      if (typedProfile?.nik) return;

      // Get NIK from user metadata
      const nik = user.user_metadata?.nik;
      if (!nik) {
        console.log('No NIK in user metadata to sync');
        return;
      }

      try {
        // Update profiles table with NIK
        const { error } = await supabase
          .from('profiles')
          .update({ nik } as any)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error syncing NIK:', error);
        } else {
          console.log('NIK synced successfully to profiles');
        }
      } catch (error) {
        console.error('Unexpected error during NIK sync:', error);
      }
    };

    // Delay sync to avoid race conditions
    const timer = setTimeout(syncNIK, 500);
    return () => clearTimeout(timer);
  }, [user, profile]);
}
