import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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
    console.log('Starting 7-day reminder check...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find pending change requests older than 7 days
    const { data: oldRequests, error: requestsError } = await supabase
      .from('member_change_requests')
      .select(`
        id,
        member_id,
        requested_at,
        members!inner(nama)
      `)
      .eq('status', 'pending')
      .lt('requested_at', sevenDaysAgo.toISOString());

    if (requestsError) {
      console.error('Error fetching old requests:', requestsError);
      throw requestsError;
    }

    console.log(`Found ${oldRequests?.length || 0} pending requests older than 7 days`);

    if (oldRequests && oldRequests.length > 0) {
      // Get all Super Admin user IDs
      const { data: superAdmins, error: adminsError } = await supabase
        .from('profiles')
        .select('user_id')
        .in('role', ['admin_pusat', 'ADMIN_PUSAT']);

      if (adminsError) {
        console.error('Error fetching super admins:', adminsError);
        throw adminsError;
      }

      console.log(`Notifying ${superAdmins?.length || 0} Super Admins`);

      // Create reminder notifications for each Super Admin
      const notifications = superAdmins?.flatMap(admin => 
        oldRequests.map(request => ({
          user_id: admin.user_id,
          title: '⏰ Reminder: Usulan Perubahan Menunggu Review',
          message: `Usulan perubahan untuk anggota "${(request as any).members.nama}" telah menunggu lebih dari 7 hari. Mohon segera direview.`,
          type: 'reminder',
          related_id: request.id,
          related_table: 'member_change_requests',
          is_read: false
        }))
      ) || [];

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifError) {
          console.error('Error creating notifications:', notifError);
          throw notifError;
        }

        console.log(`Successfully created ${notifications.length} reminder notifications`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Sent ${notifications.length} reminder notifications for ${oldRequests.length} pending requests`,
          requestCount: oldRequests.length,
          notificationCount: notifications.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log('No old pending requests found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending requests older than 7 days',
          requestCount: 0,
          notificationCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error in reminder-7-hari function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
