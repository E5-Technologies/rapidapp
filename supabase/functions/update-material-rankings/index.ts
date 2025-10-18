import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulate updating purchase counts with random increments
    // In production, this would fetch real purchase data from your system
    const { data: materials, error: fetchError } = await supabaseClient
      .from('materials')
      .select('id, purchase_count');

    if (fetchError) {
      console.error('Error fetching materials:', fetchError);
      throw fetchError;
    }

    // Update each material with a simulated purchase count increase
    for (const material of materials || []) {
      const increment = Math.floor(Math.random() * 50); // Random increment 0-50
      await supabaseClient
        .from('materials')
        .update({ 
          purchase_count: material.purchase_count + increment 
        })
        .eq('id', material.id);
    }

    console.log(`Updated rankings for ${materials?.length || 0} materials`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${materials?.length || 0} materials`,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-material-rankings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});