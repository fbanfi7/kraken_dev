import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TodayNote {
  id: string;
  patientName: string;
  noteType: string;
  time: string;
}

export interface PatientHistoryRef {
  refresh: () => void;
}

export const PatientHistory = forwardRef<PatientHistoryRef>((_, ref) => {
  const [todayNotes, setTodayNotes] = useState<TodayNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('nota_soap')
        .select(`
          id,
          fecha_creacion,
          medico_paciente!inner(
            paciente!inner(nombre)
          ),
          tipo_nota!inner(descripcion)
        `)
        .gte('fecha_creacion', `${today} 00:00:00`)
        .lt('fecha_creacion', `${today} 23:59:59`)
        .eq('medico_paciente.user_id', user.id)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error fetching today notes:', error);
        return;
      }

      const formattedNotes = data?.map((note: any) => ({
        id: note.id,
        patientName: note.medico_paciente.paciente.nombre,
        noteType: note.tipo_nota.descripcion,
        time: format(new Date(note.fecha_creacion), 'HH:mm', { locale: es })
      })) || [];

      setTodayNotes(formattedNotes);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayNotes();
  }, []);

  // Exponer la función de actualización
  useImperativeHandle(ref, () => ({
    refresh: fetchTodayNotes
  }));

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Pacientes de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : todayNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay notas creadas hoy</p>
        ) : (
          <div className="space-y-3">
            {todayNotes.map((note) => (
              <div key={note.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{note.patientName}</p>
                  <p className="text-sm text-muted-foreground">{note.noteType}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm font-medium">{note.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});