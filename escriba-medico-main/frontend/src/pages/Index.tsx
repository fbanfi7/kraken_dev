
import { useState, useEffect, useRef } from 'react';
import { AuthPage } from '@/components/AuthPage';
import { MedicalHeader } from '@/components/MedicalHeader';
import { SOAPEditor } from '@/components/SOAPEditor';
import { ConsultationsList } from '@/components/ConsultationsList';
import { PatientHistory, PatientHistoryRef } from '@/components/PatientHistory';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useConsultations, Consultation } from '@/hooks/useConsultations';
import { useAuth } from '@/hooks/useAuth';
import { useSOAPNotes } from '@/contexts/SOAPNotesContext';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

interface IndexProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Index = ({ theme, onToggleTheme }: IndexProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  
  const { user, loading } = useAuth();
  const { consultations, deleteConsultation, updateConsultation, loading: consultationsLoading } = useConsultations();
  const { setOnNoteSaved } = useSOAPNotes();
  const patientHistoryRef = useRef<PatientHistoryRef>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Configurar el callback para actualizar PatientHistory cuando se guarde una nota
  useEffect(() => {
    const callback = () => {
      if (patientHistoryRef.current) {
        patientHistoryRef.current.refresh();
      }
    };
    setOnNoteSaved(callback);
  }, []); // Remover setOnNoteSaved de las dependencias para evitar bucle infinito

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setCurrentContent(consultation.soapNote);
  };

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    if (selectedConsultation) {
      updateConsultation(selectedConsultation.id, content);
    }
  };

  const handleDeleteConsultation = (id: string) => {
    deleteConsultation(id);
    if (selectedConsultation?.id === id) {
      setSelectedConsultation(null);
      setCurrentContent('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <AuthPage theme={theme} onToggleTheme={onToggleTheme} />;
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
              {/* SOAP Editor */}
              <div className="lg:col-span-2">
                <SOAPEditor 
                  content={currentContent}
                  onContentChange={handleContentChange}
                />
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                <PatientHistory ref={patientHistoryRef} />
                <ConsultationsList
                  consultations={consultations}
                  onSelectConsultation={handleSelectConsultation}
                  onDeleteConsultation={handleDeleteConsultation}
                  selectedConsultationId={selectedConsultation?.id}
                  loading={consultationsLoading}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
