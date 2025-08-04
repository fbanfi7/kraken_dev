import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  nombre: string;
  documento?: string;
  sexo?: string;
  cobertura?: string;
  numero_telefono?: string;
}

export interface NewPatient {
  nombre: string;
  documento?: string;
  sexo?: string;
  cobertura?: string;
  numero_telefono?: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paciente')
        .select('*')
        .order('nombre');

      if (error) {
        throw error;
      }

      setPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (newPatient: NewPatient): Promise<Patient | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('paciente')
        .insert({
          ...newPatient,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchPatients(); // Refrescar la lista
      toast({
        title: "Paciente creado",
        description: "El paciente se ha creado exitosamente.",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el paciente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<NewPatient>): Promise<Patient | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('paciente')
        .update(updates)
        .eq('id', patientId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchPatients(); // Refrescar la lista
      toast({
        title: "Paciente actualizado",
        description: "La información del paciente se ha actualizado exitosamente.",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePatient = async (patientId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Primero obtenemos la relación médico-paciente
      const { data: medicoPackienteData, error: medicoPackienteError } = await supabase
        .from('medico_paciente')
        .select('id')
        .eq('paciente_id', patientId)
        .eq('user_id', user.id)
        .single();

      if (medicoPackienteError) {
        throw medicoPackienteError;
      }

      // Eliminar las notas SOAP relacionadas
      const { error: notasError } = await supabase
        .from('nota_soap')
        .delete()
        .eq('medico_paciente_id', medicoPackienteData.id);

      if (notasError) {
        throw notasError;
      }

      // Eliminar la relación médico-paciente
      const { error: relationError } = await supabase
        .from('medico_paciente')
        .delete()
        .eq('id', medicoPackienteData.id);

      if (relationError) {
        throw relationError;
      }

      // Eliminar el paciente
      const { error: patientError } = await supabase
        .from('paciente')
        .delete()
        .eq('id', patientId)
        .eq('user_id', user.id);

      if (patientError) {
        throw patientError;
      }

      await fetchPatients(); // Refrescar la lista
      toast({
        title: "Paciente eliminado",
        description: "El paciente y todas sus notas han sido eliminados exitosamente.",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    refetch: fetchPatients,
  };
};
