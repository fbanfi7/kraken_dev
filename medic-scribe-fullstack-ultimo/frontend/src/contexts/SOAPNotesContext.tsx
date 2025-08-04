
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  setOnNewNoteReceived: (callback: (content: string) => void) => void;
}

const SOAPNotesContext = createContext<SOAPNotesContextType | undefined>(undefined);

export const SOAPNotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [onNoteSaved, setOnNoteSaved] = useState<(() => void) | null>(null);
  const [onNewNoteReceived, setOnNewNoteReceived] = useState<((content: string) => void) | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

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

  const setOnNewNoteReceivedCallback = useCallback((callback: (content: string) => void) => {
    setOnNewNoteReceived(() => callback);
  }, []);

  // WebSocket para sincronización entre dispositivos
  useEffect(() => {
    if (!user?.id) {
      // Si no hay usuario, cerrar WebSocket existente
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Crear conexión WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket conectado para sincronización');
    };


    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Mensaje WebSocket recibido:', message);
        console.log('Estructura de message.data:', message.data);
        
        if (message.type === 'summary_ready' && message.data) {
          // Extraer la nota SOAP de la estructura de datos recibida
          let soapContent = null;
          
          if (message.data.soap_note) {
            soapContent = message.data.soap_note;
          }
          
          console.log('Contenido SOAP extraído:', soapContent);
          
          // Actualizar el editor con el contenido de la nueva nota
          if (onNewNoteReceived && soapContent) {
            console.log('Llamando onNewNoteReceived con:', soapContent);
            onNewNoteReceived(soapContent);
          } else {
            console.error('No se pudo extraer el contenido SOAP o onNewNoteReceived no está definido');
          }

          toast({
            title: "Nueva nota disponible",
            description: "Se ha generado una nueva nota SOAP.",
          });
        }
      } catch (error) {
        console.error('Error procesando mensaje WebSocket:', error);
      }
    };



    

    ws.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
    };

    // Cleanup al desmontar o cambiar usuario
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.id, fetchNotes, toast]);

    return (
    <SOAPNotesContext.Provider value={{
      notes,
      loading,
      fetchNotes,
      saveNote,
      clearNotes,
      createOrGetMedicoPacienteRelation,
      setOnNoteSaved: setOnNoteSavedCallback,
      setOnNewNoteReceived: setOnNewNoteReceivedCallback,
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