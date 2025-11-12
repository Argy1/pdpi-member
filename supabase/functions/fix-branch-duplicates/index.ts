import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    console.log('Starting branch duplicate fixes...')

    // Fix 1: Cabang Kalimantan TImur -> Cabang Kalimantan Timur
    const { data: fix1, error: error1 } = await supabase
      .from('members')
      .update({ cabang: 'Cabang Kalimantan Timur' })
      .eq('cabang', 'Cabang Kalimantan TImur')
      .select()

    if (error1) {
      console.error('Error fixing Kalimantan Timur:', error1)
    } else {
      console.log(`Fixed ${fix1?.length || 0} records: Kalimantan TImur -> Kalimantan Timur`)
    }

    // Fix 2: Cabang Sulut – Sulteng - Gorontalo (en-dash) -> Cabang Sulut - Sulteng - Gorontalo (hyphen)
    const { data: fix2, error: error2 } = await supabase
      .from('members')
      .update({ cabang: 'Cabang Sulut - Sulteng - Gorontalo (Suluttenggo)' })
      .eq('cabang', 'Cabang Sulut – Sulteng - Gorontalo (Suluttenggo)')
      .select()

    if (error2) {
      console.error('Error fixing Suluttenggo:', error2)
    } else {
      console.log(`Fixed ${fix2?.length || 0} records: Sulut – Sulteng -> Sulut - Sulteng`)
    }

    // Fix 3: Maluku variants -> Cabang Maluku
    const { data: fix3a, error: error3a } = await supabase
      .from('members')
      .update({ cabang: 'Cabang Maluku' })
      .eq('cabang', 'Cabang Maluku Selatan & Utara')
      .select()

    const { data: fix3b, error: error3b } = await supabase
      .from('members')
      .update({ cabang: 'Cabang Maluku' })
      .eq('cabang', 'Cabang Maluku Utara & Maluku')
      .select()

    if (error3a || error3b) {
      console.error('Error fixing Maluku:', error3a || error3b)
    } else {
      console.log(`Fixed ${(fix3a?.length || 0) + (fix3b?.length || 0)} records: Maluku variants -> Maluku`)
    }

    // Get final count
    const { data: branches, error: countError } = await supabase
      .from('members')
      .select('cabang')
      .not('cabang', 'is', null)

    if (countError) {
      console.error('Error counting branches:', countError)
    } else {
      const uniqueBranches = [...new Set(branches?.map(m => m.cabang))]
      console.log(`Total unique branches: ${uniqueBranches.length}`)
      console.log('Branches:', uniqueBranches.sort())
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Branch duplicates fixed',
        fixes: {
          kalimantan: fix1?.length || 0,
          suluttenggo: fix2?.length || 0,
          maluku: (fix3a?.length || 0) + (fix3b?.length || 0)
        },
        totalBranches: branches ? [...new Set(branches.map(m => m.cabang))].length : 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in fix-branch-duplicates:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
