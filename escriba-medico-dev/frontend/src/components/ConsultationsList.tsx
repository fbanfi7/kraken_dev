
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Consultation {
  id: string;
  timestamp: Date;
  soapNote: string | null;
}

interface ConsultationsListProps {
  consultations: Consultation[];
  onSelectConsultation: (consultation: Consultation) => void;
  onDeleteConsultation: (id: string) => void;
  selectedConsultationId?: string;
  loading?: boolean;
}

export const ConsultationsList = ({ 
  consultations, 
  onSelectConsultation, 
  onDeleteConsultation,
  selectedConsultationId,
  loading = false
}: ConsultationsListProps) => {
  const { toast } = useToast();

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteConsultation(id);
    toast({
      title: "Consulta eliminada",
      description: "La consulta ha sido eliminada exitosamente.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Historial de Consultas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : consultations.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay consultas procesadas aún
          </p>
        ) : (
          consultations.map((consultation) => (
            <div
              key={consultation.id}
              onClick={() => onSelectConsultation(consultation)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedConsultationId === consultation.id 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-muted/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    {consultation.timestamp.toLocaleString('es-ES')}
                  </div>
                  <div className="text-sm line-clamp-2">
                    {consultation.soapNote ? consultation.soapNote.substring(0, 100) + '...' : 'Sin contenido'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(consultation.id, e)}
                  className="text-destructive hover:text-destructive ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
