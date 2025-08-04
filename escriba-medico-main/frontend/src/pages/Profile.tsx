import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, FileText, Calendar, Phone, Mail, CreditCard, User, IdCard, Search, Edit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MedicalHeader } from '@/components/MedicalHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { usePatients } from '@/hooks/usePatients';
import { useSOAPNotes } from '../contexts/SOAPNotesContext';

import { PatientForm } from '@/components/PatientForm';
import { EditPatientDialog } from '@/components/EditPatientDialog';
import { DeletePatientDialog } from '@/components/DeletePatientDialog';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
interface ProfileProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack: () => void;
}
export const Profile = ({ theme, onToggleTheme, onBack }: ProfileProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<any>(null);
  const { notes, loading } = useSOAPNotes();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Create a map of patients from SOAP notes
  const patients = notes.reduce((acc, note) => {
    const patientId = note.medico_paciente.paciente.id;
    const existing = acc.find(p => p.id === patientId);
    
    if (existing) {
      existing.totalNotes += 1;
      if (new Date(note.fecha_creacion) > existing.lastVisit) {
        existing.lastVisit = new Date(note.fecha_creacion);
      }
    } else {
      acc.push({
        id: patientId,
        name: note.medico_paciente.paciente.nombre,
        document: note.medico_paciente.paciente.documento,
        cobertura: note.medico_paciente.paciente.cobertura,
        numero_telefono: note.medico_paciente.paciente.numero_telefono,
        sexo: note.medico_paciente.paciente.sexo,
        totalNotes: 1,
        lastVisit: new Date(note.fecha_creacion)
      });
    }
    return acc;
  }, [] as any[]);

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatientNotes = selectedPatient
    ? notes.filter(note => note.medico_paciente.paciente.id === selectedPatient.id)
    : [];
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEditPatient = (patient: any) => {
    setPatientToEdit({
      id: patient.id,
      nombre: patient.name,
      documento: patient.document,
      sexo: patient.sexo,
      cobertura: patient.cobertura,
      numero_telefono: patient.numero_telefono,
    });
    setEditPatientModalOpen(true);
  };
  if (selectedPatient) {
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

              <div className="flex items-center gap-4 mb-6 px-4 sm:px-0">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a pacientes
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                {/* Información del paciente */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          {selectedPatient.name}
                        </div>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleEditPatient(selectedPatient)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar paciente</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <DeletePatientDialog 
                            patient={selectedPatient} 
                            asButton={true}
                            onDeleteSuccess={() => setSelectedPatient(null)}
                          />
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Información del paciente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedPatient.document && <div className="flex items-center gap-3">
                          <IdCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Documento: {selectedPatient.document}</span>
                        </div>}
                      {selectedPatient.numero_telefono && <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedPatient.numero_telefono}</span>
                        </div>}
                      {selectedPatient.cobertura && <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Cobertura: {selectedPatient.cobertura}</span>
                        </div>}
                      {selectedPatient.sexo && <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Sexo: {selectedPatient.sexo}</span>
                        </div>}
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Última visita: {formatDate(selectedPatient.lastVisit)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedPatient.totalNotes} notas generadas
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notas del paciente */}
                <div className="lg:col-span-2">
                  <Card className="h-[600px]">
                    <CardHeader>
                      <CardTitle>Notas Generadas</CardTitle>
                      <CardDescription>
                        Historial de consultas y notas SOAP
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div> : selectedPatientNotes.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                          No hay notas disponibles para este paciente
                        </div> : <ScrollArea className="h-[500px]">
                          <div className="space-y-4">
                            {selectedPatientNotes.map(note => <Card key={note.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                      {formatDate(new Date(note.fecha_creacion))}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={note.firmado ? "default" : "secondary"}>
                                        {note.firmado ? "Firmado" : "Borrador"}
                                      </Badge>
                                      {note.editado && <Badge variant="outline">Editado</Badge>}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm font-sans">
                                      {note.contenido}
                                    </pre>
                                  </div>
                                </CardContent>
                              </Card>)}
                          </div>
                        </ScrollArea>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
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

            <div className="flex items-center gap-4 mb-6 px-4 sm:px-0">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al dashboard
              </Button>
            </div>

            <div className="mb-6 px-4 sm:px-0 animate-fade-in">
              <h1 className="text-3xl font-bold">Portal de pacientes</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus pacientes, revisa las notas generadas y tipos de resúmenes
              </p>
            </div>

            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4 sm:px-0 animate-fade-in">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{patients.length}</div>
                  <p className="text-xs text-muted-foreground">Total de pacientes</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">
                    {patients.reduce((acc, patient) => acc + patient.totalNotes, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Resúmenes generados</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">SOAP</div>
                  <p className="text-xs text-muted-foreground">Tipo de nota principal</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mx-4 sm:mx-0 my-0 py-[22px] px-[9px]">
              <CardHeader className="mx-0 px-0 py-0 my-0">
                <CardTitle>Mis Pacientes</CardTitle>
                <CardDescription>
                  Lista de pacientes y sus notas médicas generadas
                </CardDescription>
                <div className="flex justify-center mt-4">
                  <Button 
                    className="w-full sm:w-auto min-w-[200px] max-w-[280px] hover:scale-105 transition-transform"
                    onClick={() => setShowPatientForm(true)}
                  >
                    Crear paciente
                  </Button>
                </div>
                
                {/* Search bar */}
                <div className="relative mt-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar pacientes por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="py-[8px]">
                {loading ? <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : filteredPatients.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No hay pacientes disponibles'}
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatients.map((patient, index) => <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardHeader className="pb-3 my-[10px]">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3" onClick={() => setSelectedPatient(patient)}>
                               <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                                 <span className="text-primary font-semibold">
                                   {patient.name.split(' ').map(n => n[0]).join('')}
                                 </span>
                               </div>
                               <div>
                                 <CardTitle className="text-base">{patient.name}</CardTitle>
                                 {patient.document && <CardDescription className="text-xs">
                                     Doc: {patient.document}
                                   </CardDescription>}
                               </div>
                             </div>
                            <div className="flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                     <Button variant="ghost" size="sm" onClick={() => handleEditPatient(patient)} className="hover:scale-105 transition-transform touch-target">
                                       <Edit className="h-4 w-4" />
                                     </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Editar paciente</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DeletePatientDialog 
                                patient={patient} 
                                asButton={true}
                                onDeleteSuccess={() => {}}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent onClick={() => setSelectedPatient(patient)}>
                          <div className="space-y-2">
                            {patient.numero_telefono && <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{patient.numero_telefono}</span>
                              </div>}
                            {patient.cobertura && <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Cobertura: {patient.cobertura}</span>
                              </div>}
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Última nota:</span>
                              <span>{formatDate(patient.lastVisit)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Notas:</span>
                              <Badge variant="secondary">
                                {patient.totalNotes}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>}
              </CardContent>
            </Card>

            <PatientForm 
              open={showPatientForm}
              onOpenChange={setShowPatientForm}
              onPatientCreated={() => {}}
            />

            {patientToEdit && (
              <EditPatientDialog 
                open={editPatientModalOpen}
                onOpenChange={setEditPatientModalOpen}
                patient={patientToEdit}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};