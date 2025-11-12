import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationRequest {
  nik: string
  email: string
  password: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { nik, email, password }: RegistrationRequest = await req.json()

    // Server-side validation
    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NIK harus 16 digit angka' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email || !password || password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email atau password tidak valid' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Check if NIK exists in members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('id, nik, npa, nama, cabang')
      .eq('nik', nik)
      .maybeSingle()

    if (memberError) {
      console.error('Error checking member:', memberError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Terjadi kesalahan saat memeriksa data' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Validate NIK exists
    if (!memberData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NIK tidak terdaftar. Hubungi sekretariat PD Anda.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Check if member already has account linked
    // Note: members table doesn't have user_id column, we check via email match
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const isAlreadyLinked = existingUser.users.some(
      user => user.user_metadata?.nik === nik
    )
    
    if (isAlreadyLinked) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NIK ini sudah terdaftar. Silakan login.' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Get branch_id from cabang
    let branchId = null
    if (memberData.cabang) {
      const { data: branchData } = await supabase
        .from('branches')
        .select('id')
        .eq('name', memberData.cabang)
        .maybeSingle()
      
      if (branchData) {
        branchId = branchData.id
      }
    }

    // Step 5: Create user with Supabase Auth
    // SECURITY: Force app_role to 'user' - never accept from client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        app_role: 'user', // FORCED - never from client
        npa: memberData.npa,
        nama: memberData.nama,
        cabang: memberData.cabang,
        pd_id: branchId,
        nik: nik
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Handle duplicate email
      if (authError.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Email sudah terdaftar. Gunakan email lain atau login.' 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: authError.message || 'Gagal membuat akun' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gagal membuat akun pengguna' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 6: Update member email if needed
    // Note: members table doesn't have user_id column
    // We link users via NIK stored in user_metadata
    if (memberData.email !== email) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ email: email })
        .eq('id', memberData.id)

      if (updateError) {
        console.error('Error updating member email:', updateError)
        // Don't fail registration - user is created, just log the error
      }
    }

    // Step 7: Profile is automatically created by handle_new_user() trigger
    // No need to manually insert/update profile here
    // The trigger uses user_metadata.app_role which we set to 'user' above

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Registrasi berhasil. Profil Anda sudah terhubung dengan data anggota.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          npa: memberData.npa,
          nama: memberData.nama,
          cabang: memberData.cabang
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak terduga' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
