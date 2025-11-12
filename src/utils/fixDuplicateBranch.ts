import { supabase } from "@/integrations/supabase/client";

/**
 * Fix all duplicate branch names across the database
 * This updates members with variant branch names to use standard names
 */
export async function fixDuplicateBranch() {
  try {
    const fixes = [
      {
        standard: 'Cabang Kalimantan Timur',
        variants: ['Cabang Kalimantan TImur'] // typo version
      },
      {
        standard: 'Cabang Sulut - Sulteng - Gorontalo (Suluttenggo)',
        variants: [
          'Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)', // en-dash version
        ]
      },
      {
        standard: 'Cabang Maluku',
        variants: [
          'Cabang Maluku Selatan & Utara',
          'Cabang Maluku Utara & Maluku'
        ]
      }
    ];

    const allResults = [];
    
    for (const fix of fixes) {
      for (const variant of fix.variants) {
        const { data, error } = await supabase
          .from('members')
          .update({ cabang: fix.standard })
          .eq('cabang', variant)
          .select();

        if (error) {
          console.error(`Error fixing variant "${variant}":`, error);
        } else if (data && data.length > 0) {
          console.log(`Fixed ${data.length} member(s) from "${variant}" to "${fix.standard}"`);
          allResults.push(...data);
        }
      }
    }

    return { success: true, data: allResults, count: allResults.length };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}
