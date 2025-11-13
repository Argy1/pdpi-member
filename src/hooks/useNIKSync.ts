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

      // Get NIK from user metadata - check both 'nik' and 'name' fields
      let nik = user.user_metadata?.nik || user.user_metadata?.name;
      
      // Validate NIK (should be 16 digits)
      if (nik && /^\d{16}$/.test(nik)) {
        try {
          // Update profiles table with NIK
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ nik } as any)
            .eq('user_id', user.id);

          if (profileError) {
            console.error('Error syncing NIK to profile:', profileError);
          } else {
            console.log('NIK synced successfully to profiles:', nik);
            
            // Also update user metadata to have nik field
            if (!user.user_metadata?.nik) {
              const { error: authError } = await supabase.auth.updateUser({
                data: { nik }
              });
              
              if (authError) {
                console.error('Error updating user metadata:', authError);
              }
            }
          }
        } catch (error) {
          console.error('Unexpected error during NIK sync:', error);
        }
      } else {
        console.log('No valid NIK found in user metadata to sync');
      }
    };

    // Delay sync to avoid race conditions
    const timer = setTimeout(syncNIK, 500);
    return () => clearTimeout(timer);
  }, [user, profile]);
}
