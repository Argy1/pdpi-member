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

    // Step 1: STRICT - Check if NIK exists in members table
    // This is the primary validation - NIK MUST exist
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
          error: 'Terjadi kesalahan saat memeriksa data anggota' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: CRITICAL VALIDATION - NIK must exist in database
    // Reject registration if NIK not found
    if (!memberData) {
      console.log('Registration rejected: NIK not found -', nik)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NIK tidak terdaftar dalam database. Silakan hubungi sekretariat PD Anda untuk mendaftarkan data Anda terlebih dahulu.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log successful NIK validation
    console.log('NIK validated successfully:', nik, '- Member:', memberData.nama)

    // Step 3: Check if NIK already linked to an account
    // This prevents duplicate registrations with same NIK
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const isAlreadyLinked = existingUser.users.some(
      user => user.user_metadata?.nik === nik
    )
    
    if (isAlreadyLinked) {
      console.log('Registration rejected: NIK already registered -', nik)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NIK ini sudah terdaftar dan terhubung dengan akun. Silakan login atau reset password jika lupa.' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Step 3.5: Check if email already registered
    const { data: emailCheck } = await supabase.auth.admin.listUsers()
    const emailExists = emailCheck.users.some(user => user.email === email)
    
    if (emailExists) {
      console.log('Registration rejected: Email already registered -', email)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email sudah terdaftar. Gunakan email lain atau login jika sudah memiliki akun.' 
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
    // SECURITY: Include NIK in metadata for trigger validation
    console.log('Creating user account for NIK:', nik, '- Email:', email)
    
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
        nik: nik // CRITICAL: NIK for trigger validation
      }
    })

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: (authError as any).code,
        details: (authError as any).details
      })
      
      // Handle trigger errors (from handle_new_user function)
      if (authError.message?.includes('NIK') || 
          authError.message?.includes('metadata') ||
          authError.message?.includes('tidak terdaftar')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: authError.message.includes('tidak terdaftar') 
              ? 'NIK tidak valid atau tidak terdaftar dalam database. Hubungi sekretariat PD Anda.'
              : authError.message
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Handle duplicate email
      if (authError.message?.includes('already registered') || 
          authError.message?.includes('User already registered') ||
          authError.message?.includes('duplicate')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Email sudah terdaftar. Gunakan email lain atau login jika sudah memiliki akun.' 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Handle RLS or constraint violations
      if (authError.message?.includes('violates') || 
          authError.message?.includes('policy') ||
          authError.message?.includes('constraint')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Terjadi kesalahan database. NIK atau email mungkin sudah terdaftar. Detail: ' + authError.message
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generic auth error with full message for debugging
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gagal membuat akun: ' + (authError.message || 'Silakan coba lagi.')
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
    console.log('Registration successful for NIK:', nik, '- User ID:', authData.user.id)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Registrasi berhasil! Profil Anda sudah terhubung dengan data anggota.',
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
