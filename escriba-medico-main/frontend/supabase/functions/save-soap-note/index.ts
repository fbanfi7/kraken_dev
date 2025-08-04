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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const { patientId, soapContent, patientName, patientDocument } = await req.json();

    if (!soapContent) {
      throw new Error('Contenido SOAP requerido');
    }

    console.log('Saving SOAP note for user:', user.id);

    // Get or create patient
    let pacienteId = patientId;
    
    if (!pacienteId && patientName) {
      // Create new patient
      const { data: newPatient, error: patientError } = await supabaseClient
        .from('paciente')
        .insert({
          nombre: patientName,
          documento: patientDocument || null,
          sexo: null
        })
        .select()
        .single();

      if (patientError) {
        console.error('Error creating patient:', patientError);
        throw new Error('Error al crear paciente');
      }

      pacienteId = newPatient.id;
    }

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

    // Create or get medico_paciente relationship
    let medicoPacienteId;
    
    if (pacienteId) {
      const { data: existingRelation } = await supabaseClient
        .from('medico_paciente')
        .select('id')
        .eq('medico_id', medico.id)
        .eq('paciente_id', pacienteId)
        .single();

      if (existingRelation) {
        medicoPacienteId = existingRelation.id;
      } else {
        const { data: newRelation, error: relationError } = await supabaseClient
          .from('medico_paciente')
          .insert({
            medico_id: medico.id,
            paciente_id: pacienteId,
          })
          .select()
          .single();

        if (relationError) {
          console.error('Error creating medico_paciente relation:', relationError);
          throw new Error('Error al crear relación médico-paciente');
        }

        medicoPacienteId = newRelation.id;
      }
    }

    // Save SOAP note
    const { data: soapNote, error: soapError } = await supabaseClient
      .from('nota_soap')
      .insert({
        medico_paciente_id: medicoPacienteId,
        contenido: soapContent,
        editado: false,
        firmado: false,
      })
      .select()
      .single();

    if (soapError) {
      console.error('Error saving SOAP note:', soapError);
      throw new Error('Error al guardar nota SOAP');
    }

    console.log('SOAP note saved successfully:', soapNote.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        noteId: soapNote.id,
        message: 'Nota SOAP guardada exitosamente'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-soap-note function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});