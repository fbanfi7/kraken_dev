import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check for Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!user) {
      console.log('No user found in token');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Getting SOAP notes for user:', user.id);

    // Get user profile from medico table
    const { data: medico, error: medicoError } = await supabaseClient
      .from('medico')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (medicoError || !medico) {
      console.error('Medico error:', medicoError);
      throw new Error('Perfil de médico no encontrado');
    }

    // Get SOAP notes with patient information
    const { data: notes, error: notesError } = await supabaseClient
      .from('nota_soap')
      .select(`
        id,
        contenido,
        fecha_creacion,
        editado,
        firmado,
        medico_paciente!inner(
          id,
          fecha_primera_consulta,
          paciente!inner(
            id,
            nombre,
            documento,
            sexo,
            cobertura,
            numero_telefono
          )
        )
      `)
      .eq('medico_paciente.medico_id', medico.id)
      .order('fecha_creacion', { ascending: false });

    if (notesError) {
      console.error('Error getting SOAP notes:', notesError);
      throw new Error('Error al obtener notas SOAP');
    }

    console.log(`Found ${notes?.length || 0} SOAP notes`);

    return new Response(
      JSON.stringify({ notes: notes || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-soap-notes function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});