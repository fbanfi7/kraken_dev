
import { useState, useEffect } from 'react';
import { useSOAPNotes, SOAPNote } from '../contexts/SOAPNotesContext';
import { useAuth } from '@/hooks/useAuth';

export interface Consultation {
  id: string;
  timestamp: Date;
  soapNote: string | null;
  patient?: {
    name: string;
    document?: string;
  };
}

export const useConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const { notes, loading, fetchNotes, clearNotes } = useSOAPNotes();
  const { user } = useAuth();

  // Convert SOAP notes to consultations format
  useEffect(() => {
    if (notes.length > 0) {
      const convertedConsultations: Consultation[] = notes.map((note: SOAPNote) => ({
        id: note.id,
        timestamp: new Date(note.fecha_creacion),
        soapNote: note.contenido,
        patient: {
          name: note.medico_paciente.paciente.nombre,
          document: note.medico_paciente.paciente.documento || undefined,
        }
      }));
      setConsultations(convertedConsultations);
    } else {
      setConsultations([]);
    }
  }, [notes]);

  // Fetch notes when user is authenticated
  useEffect(() => {
    if (user && notes.length === 0) {
      fetchNotes();
    } else if (!user) {
      clearNotes();
      setConsultations([]);
    }
  }, [user]);

  const fetchNewConsultations = async () => {
    if (user) {
      await fetchNotes();
    }
  };

  const deleteConsultation = (id: string) => {
    setConsultations(prev => prev.filter(consultation => consultation.id !== id));
  };

  const updateConsultation = (id: string, soapNote: string) => {
    setConsultations(prev => 
      prev.map(consultation => 
        consultation.id === id 
          ? { ...consultation, soapNote }
          : consultation
      )
    );
  };

  return {
    consultations,
    deleteConsultation,
    updateConsultation,
    loading,
    fetchNewConsultations
  };
};
