
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SOAPNote {
  id: string;
  contenido: string;
  fecha_creacion: string;
  editado: boolean;
  firmado: boolean;
  medico_paciente: {
    id: string;
    fecha_primera_consulta: string;
    paciente: {
      id: string;
      nombre: string;
      documento: string | null;
      sexo: string | null;
      cobertura: string | null;
      numero_telefono: string | null;
    };
  };
}

interface SOAPNotesContextType {
  notes: SOAPNote[];
  loading: boolean;
  fetchNotes: () => Promise<void>;
  saveNote: (content: string, medicoPacienteId: string, tipoNotaId?: number) => Promise<string>;
  clearNotes: () => void;
  createOrGetMedicoPacienteRelation: (pacienteId: string) => Promise<string>;
  setOnNoteSaved: (callback: () => void) => void;
}

const SOAPNotesContext = createContext<SOAPNotesContextType | undefined>(undefined);

export const SOAPNotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [onNoteSaved, setOnNoteSaved] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-soap-notes');

      if (error) {
        throw new Error(error.message);
      }

      setNotes(data.notes || []);
    } catch (error: any) {
      console.error('Error fetching SOAP notes:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las notas SOAP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (content: string, medicoPacienteId: string, tipoNotaId?: number) => {
    try {
      const { data, error } = await supabase
        .from('nota_soap')
        .insert({
          contenido: content,
          medico_paciente_id: medicoPacienteId,
          tipo_nota_id: tipoNotaId,
          firmado: false,
          editado: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Nota guardada",
        description: "La nota SOAP se ha guardado exitosamente.",
      });

      // Refresh notes after saving
      await fetchNotes();
      
      // Notificar que se guardó una nota
      if (onNoteSaved) {
        onNoteSaved();
      }
      
      return data.id;
    } catch (error: any) {
      console.error('Error saving SOAP note:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la nota SOAP.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createOrGetMedicoPacienteRelation = async (pacienteId: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener el médico del usuario actual
      const { data: medico, error: medicoError } = await supabase
        .from('medico')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (medicoError || !medico) {
        throw new Error('No se encontró el perfil de médico');
      }

      // Buscar relación existente
      const { data: existingRelation, error: relationError } = await supabase
        .from('medico_paciente')
        .select('id')
        .eq('medico_id', medico.id)
        .eq('paciente_id', pacienteId)
        .maybeSingle();

      if (relationError) {
        throw relationError;
      }

      if (existingRelation) {
        return existingRelation.id;
      }

      // Crear nueva relación
      const { data: newRelation, error: newRelationError } = await supabase
        .from('medico_paciente')
        .insert({
          medico_id: medico.id,
          paciente_id: pacienteId,
          user_id: user.id
        })
        .select('id')
        .single();

      if (newRelationError) {
        throw newRelationError;
      }

      return newRelation.id;
    } catch (error: any) {
      console.error('Error creating/getting medico-paciente relation:', error);
      throw error;
    }
  };

  const clearNotes = () => {
    setNotes([]);
    setLoading(false);
  };

  const setOnNoteSavedCallback = useCallback((callback: () => void) => {
    setOnNoteSaved(() => callback);
  }, []);

  return (
    <SOAPNotesContext.Provider value={{
      notes,
      loading,
      fetchNotes,
      saveNote,
      clearNotes,
      createOrGetMedicoPacienteRelation,
      setOnNoteSaved: setOnNoteSavedCallback,
    }}>
      {children}
    </SOAPNotesContext.Provider>
  );
};

export const useSOAPNotes = () => {
  const context = useContext(SOAPNotesContext);
  if (context === undefined) {
    throw new Error('useSOAPNotes must be used within a SOAPNotesProvider');
  }
  return context;
};
