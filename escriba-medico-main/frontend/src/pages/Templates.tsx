import { useState, useEffect } from 'react';
import { MedicalHeader } from '@/components/MedicalHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNoteTypes } from '@/hooks/useNoteTypes';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplatesProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack: () => void;
}

export function Templates({ theme, onToggleTheme, onBack }: TemplatesProps) {
  const { noteTypes, loading } = useNoteTypes();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTemplateClick = (template: any) => {
    setSelectedTemplate(template);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground transition-colors duration-300">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <div className="container mx-auto p-6 max-w-7xl relative">
            {/* Theme Toggle - positioned absolutely in top right */}
            <div className="absolute top-6 right-6 z-10">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>

            {/* Sidebar Trigger - positioned on the border */}
            <div className="absolute left-0 top-6 z-10">
              <SidebarTrigger className="border-r border-border bg-background hover:bg-muted" />
            </div>

            {/* Header */}
            <div className="mb-6 pr-16 pl-16">
              <MedicalHeader currentTime={currentTime} />
            </div>
            
            <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al dashboard
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Nota Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Cargando plantillas...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre de Plantilla</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Último uso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {noteTypes.map((noteType) => (
                          <TableRow 
                            key={noteType.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleTemplateClick(noteType)}
                          >
                            <TableCell className="font-medium">
                              {noteType.descripcion}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Nota</Badge>
                            </TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>-</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.descripcion}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Descripción:</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedTemplate?.prompt || 'No hay prompt definido para esta plantilla.'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}