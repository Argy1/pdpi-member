import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  nama: string;
  npa?: string;
  tempat_tugas: string;
  kota_kabupaten_kantor?: string;
  provinsi_kantor: string;
  cabang?: string;
  status?: string;
  email?: string;
  no_hp?: string;
  gelar?: string;
  gelar2?: string;
  tgl_lahir?: string;
  jenis_kelamin?: string;
  thn_lulus?: number;
  alumni?: string;
  alamat_rumah?: string;
  kota_kabupaten_rumah?: string;
  provinsi_rumah?: string;
  tempat_lahir?: string;
  keterangan?: string;
  foto?: string;
}

interface ImportRequest {
  rows: ImportRow[];
  mode: 'insert' | 'upsert' | 'skip';
  createBranchIfMissing: boolean;
  forceAdminBranch: boolean;
  chunk?: number;
  total?: number;
}

interface ImportResponse {
  inserted: number;
  updated: number;
  duplicate: number;
  invalid: number;
  cabangError: number;
  systemError: number;
  sampleErrors: Array<{
    row: number;
    reason: string;
    details: string;
    data: any;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response('Unauthorized', { 
          status: 401, 
          headers: corsHeaders 
        });
      }
    }

    const body: ImportRequest = await req.json();
    const { rows, mode, createBranchIfMissing, forceAdminBranch, chunk, total } = body;

    console.log(`Processing chunk ${chunk}/${total} with ${rows.length} rows`);

    let inserted = 0;
    let updated = 0;
    let duplicate = 0;
    let invalid = 0;
    let cabangError = 0;
    let systemError = 0;
    const sampleErrors: any[] = [];

    // Get existing branches
    const { data: branches } = await supabase.from('branches').select('id, name');
    const branchMap = new Map(branches?.map(b => [b.name.toLowerCase().trim(), b.id]) || []);

    // Process each row individually to avoid transaction timeouts
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Validate required fields - only skip if nama is missing (most critical)
        if (!row.nama || !row.nama.trim()) {
          invalid++;
          if (sampleErrors.length < 5) {
            sampleErrors.push({
              row: i + 1,
              reason: 'FIELD_REQUIRED',
              details: 'Missing required field: nama',
              data: row
            });
          }
          continue;
        }

        // Set default values for missing non-critical fields
        if (!row.provinsi_kantor) row.provinsi_kantor = 'Tidak Diketahui';
        if (!row.tempat_tugas) row.tempat_tugas = 'Tidak Diketahui';

        // Handle branch mapping
        let cabangId = null;
        if (forceAdminBranch) {
          // Get user's branch from profile
          const authHeader = req.headers.get('Authorization');
          if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('branch_id')
                .eq('user_id', user.id)
                .single();
              cabangId = profile?.branch_id;
            }
          }
        } else if (row.cabang) {
          const normalizedBranch = row.cabang.toLowerCase().trim();
          cabangId = branchMap.get(normalizedBranch);
          
          if (!cabangId && createBranchIfMissing) {
            // Create new branch
            const { data: newBranch, error } = await supabase
              .from('branches')
              .insert({ name: row.cabang })
              .select('id')
              .single();
              
            if (newBranch && !error) {
              cabangId = newBranch.id;
              branchMap.set(normalizedBranch, cabangId);
            }
          }
          
          if (!cabangId) {
            cabangError++;
            if (sampleErrors.length < 5) {
              sampleErrors.push({
                row: i + 1,
                reason: 'CABANG_FK',
                details: `Branch '${row.cabang}' not found`,
                data: row
              });
            }
            continue;
          }
        }

        // Prepare data for insert/update
        const memberData: any = {
          nama: row.nama,
          tempat_tugas: row.tempat_tugas,
          provinsi_kantor: row.provinsi_kantor,
          status: row.status || 'Biasa',
        };

        // Add optional fields if present
        if (row.npa) memberData.npa = row.npa;
        if (row.kota_kabupaten_kantor) memberData.kota_kabupaten_kantor = row.kota_kabupaten_kantor;
        if (row.provinsi_kantor) memberData.provinsi_kantor = row.provinsi_kantor;
        if (row.email) memberData.email = row.email;
        if (row.no_hp) memberData.no_hp = row.no_hp;
        if (row.gelar) memberData.gelar = row.gelar;
        if (row.gelar2) memberData.gelar2 = row.gelar2;
        if (row.tgl_lahir) memberData.tgl_lahir = row.tgl_lahir;
        if (row.jenis_kelamin) memberData.jenis_kelamin = row.jenis_kelamin;
        if (row.thn_lulus) memberData.thn_lulus = row.thn_lulus;
        if (row.alumni) memberData.alumni = row.alumni;
        if (row.alamat_rumah) memberData.alamat_rumah = row.alamat_rumah;
        if (row.kota_kabupaten_rumah) memberData.kota_kabupaten_rumah = row.kota_kabupaten_rumah;
        if (row.provinsi_rumah) memberData.provinsi_rumah = row.provinsi_rumah;
        if (row.tempat_lahir) memberData.tempat_lahir = row.tempat_lahir;
        if (row.keterangan) memberData.keterangan = row.keterangan;
        if (row.foto) memberData.foto = row.foto;
        if (row.cabang) memberData.cabang = row.cabang;

        if (mode === 'upsert') {
          // Check if member exists
          const whereCondition = row.npa ? 
            { npa: row.npa } : 
            { nama: row.nama, tempat_tugas: row.tempat_tugas };
          
          const { data: existing } = await supabase
            .from('members')
            .select('id')
            .match(whereCondition)
            .maybeSingle();
          
          if (existing) {
            const { error } = await supabase
              .from('members')
              .update(memberData)
              .eq('id', existing.id);
            
            if (error) {
              throw error;
            }
            updated++;
          } else {
            const { error } = await supabase
              .from('members')
              .insert(memberData);
            
            if (error) {
              throw error;
            }
            inserted++;
          }
        } else if (mode === 'insert') {
          const { error } = await supabase
            .from('members')
            .insert(memberData);
          
          if (error) {
            if (error.code === '23505') { // Unique constraint violation
              duplicate++;
              if (sampleErrors.length < 5) {
                sampleErrors.push({
                  row: i + 1,
                  reason: 'DUPLICATE',
                  details: `Duplicate member: ${row.nama}`,
                  data: row
                });
              }
            } else {
              throw error;
            }
          } else {
            inserted++;
          }
        } else if (mode === 'skip') {
          // Check if member exists
          const whereCondition = row.npa ? 
            { npa: row.npa } : 
            { nama: row.nama, tempat_tugas: row.tempat_tugas };
          
          const { data: existing } = await supabase
            .from('members')
            .select('id')
            .match(whereCondition)
            .maybeSingle();
          
          if (existing) {
            duplicate++;
            if (sampleErrors.length < 5) {
              sampleErrors.push({
                row: i + 1,
                reason: 'DUPLICATE',
                details: `Member already exists: ${row.nama}`,
                data: row
              });
            }
          } else {
            const { error } = await supabase
              .from('members')
              .insert(memberData);
            
            if (error) {
              throw error;
            }
            inserted++;
          }
        }

      } catch (error: any) {
        console.error(`Error processing row ${i + 1}:`, error);
        
        // Classify errors
        if (error?.code === '23505') { // Unique constraint violation
          duplicate++;
          if (sampleErrors.length < 5) {
            sampleErrors.push({
              row: i + 1,
              reason: 'DUPLICATE',
              details: `Duplicate constraint: ${error.detail || error.message}`,
              data: row
            });
          }
        } else if (error?.code === '23503') { // Foreign key violation
          cabangError++;
          if (sampleErrors.length < 5) {
            sampleErrors.push({
              row: i + 1,
              reason: 'CABANG_FK',
              details: `Foreign key constraint: ${error.detail || error.message}`,
              data: row
            });
          }
        } else {
          systemError++;
          if (sampleErrors.length < 5) {
            sampleErrors.push({
              row: i + 1,
              reason: 'SYSTEM',
              details: error.message || String(error),
              data: row
            });
          }
        }
      }
    }

    const response: ImportResponse = {
      inserted,
      updated,
      duplicate,
      invalid,
      cabangError,
      systemError,
      sampleErrors
    };

    console.log(`Chunk ${chunk} completed:`, response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});