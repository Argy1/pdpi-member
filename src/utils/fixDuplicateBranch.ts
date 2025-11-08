import { supabase } from "@/integrations/supabase/client";

/**
 * Fix duplicate branch name for Sulut-Sulteng-Gorontalo
 * This updates the member with the en-dash version to use the standard hyphen version
 */
export async function fixDuplicateBranch() {
  try {
    const standardName = 'Cabang Sulut - Sulteng - Gorontalo (Suluttenggo)';
    
    // Update all variants to the standard name
    const variants = [
      'Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)', // en-dash version
      'Cabang Sulut - Sulteng - Gorontalo (Sulutenggo)', // single 't' version
    ];

    const results = [];
    
    for (const variant of variants) {
      const { data, error } = await supabase
        .from('members')
        .update({ cabang: standardName })
        .eq('cabang', variant)
        .select();

      if (error) {
        console.error(`Error fixing variant "${variant}":`, error);
      } else if (data && data.length > 0) {
        console.log(`Fixed ${data.length} member(s) from variant "${variant}"`);
        results.push(...data);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}
