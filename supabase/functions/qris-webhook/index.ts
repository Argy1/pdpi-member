import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const payload = await req.json();
    
    console.log('Received webhook:', payload);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log webhook
    const { error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        gateway: payload.gateway || 'fake_qris',
        order_id: payload.order_id,
        payload: payload,
        verified: true, // In production, verify signature
        status_parsed: payload.status
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Parse status - FAKE MODE accepts 'PAID' directly
    if (payload.status === 'PAID' && payload.order_id) {
      // Find payment group by group_code
      const { data: paymentGroup, error: fetchError } = await supabaseClient
        .from('payment_groups')
        .select('*')
        .eq('group_code', payload.order_id)
        .single();

      if (fetchError || !paymentGroup) {
        console.error('Payment group not found:', payload.order_id);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Payment group not found' 
          }),
          { 
            status: 404,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            }
          }
        );
      }

      // Update payment group status to PAID
      const { error: updateError } = await supabaseClient
        .from('payment_groups')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString()
        })
        .eq('id', paymentGroup.id);

      if (updateError) {
        console.error('Error updating payment group:', updateError);
        throw updateError;
      }

      console.log('Payment group updated to PAID:', paymentGroup.id);

      // Update webhook log as processed
      await supabaseClient
        .from('webhook_logs')
        .update({ processed_at: new Date().toISOString() })
        .eq('order_id', payload.order_id);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Payment confirmed'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook received'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
