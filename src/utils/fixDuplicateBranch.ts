import { supabase } from "@/integrations/supabase/client";

/**
 * Fix duplicate branch name for Sulut-Sulteng-Gorontalo
 * This updates the member with the en-dash version to use the standard hyphen version
 */
export async function fixDuplicateBranch() {
  try {
    // Update the member with the variant spelling
    const { data, error } = await supabase
      .from('members')
      .update({ cabang: 'Cabang Sulut - Sulteng - Gorontalo (Suluttenggo)' })
      .eq('cabang', 'Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)')
      .select();

    if (error) {
      console.error('Error fixing duplicate branch:', error);
      return { success: false, error };
    }

    console.log('Fixed duplicate branch for', data?.length, 'member(s)');
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}
