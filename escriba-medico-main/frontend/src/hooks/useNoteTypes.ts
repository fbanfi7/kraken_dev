import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NoteType {
  id: number;
  descripcion: string;
  prompt: string;
}

export const useNoteTypes = () => {
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNoteTypes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tipo_nota')
        .select('id, descripcion, prompt')
        .order('id');

      if (error) {
        throw error;
      }

      setNoteTypes(data || []);
    } catch (error) {
      console.error('Error fetching note types:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de nota.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteTypes();
  }, []);

  return {
    noteTypes,
    loading,
    refetch: fetchNoteTypes
  };
};