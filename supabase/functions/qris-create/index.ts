import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { group_code, amount } = await req.json();

    console.log('Creating QRIS payment:', { group_code, amount });

    // FAKE MODE - Generate dummy QR code data
    // In production, this would call actual payment gateway API
    const qrisData = {
      qr_string: `00020101021226670016ID.LINKAJA.WWW011893600915127021027080000000000303UMI51440014ID.OR.GPNQR0215ID1234567890120303UMI520454995303360540${amount}5802ID5925PDPI - Iuran Anggota6007Jakarta610512345623070703A016304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FAKE_QR_${group_code}`,
      gateway_tx_id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      status: 'PENDING'
    };

    console.log('QRIS created (FAKE MODE):', qrisData);

    return new Response(
      JSON.stringify({
        success: true,
        data: qrisData,
        message: 'QRIS payment created (FAKE MODE)'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating QRIS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
