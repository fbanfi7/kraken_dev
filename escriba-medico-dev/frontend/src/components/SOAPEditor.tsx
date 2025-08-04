import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorToolbar } from './EditorToolbar';
import { PatientSelectionDialog } from './PatientSelectionDialog';
import { Copy, Save, Mic, Square, Pause, Play, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useSOAPNotes } from '../contexts/SOAPNotesContext';
import { useNoteTypes } from '@/hooks/useNoteTypes';
import { Patient } from '@/hooks/usePatients';

interface SOAPEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  isLoading?: boolean;
}

export const SOAPEditor = ({
  content,
  onContentChange,
  isLoading = false
}: SOAPEditorProps) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<string>("");
  const [showNoteTypeError, setShowNoteTypeError] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const { saveNote, createOrGetMedicoPacienteRelation } = useSOAPNotes();
  const { noteTypes, loading: noteTypesLoading } = useNoteTypes();

  // Hook para grabación de audio
  const selectedNotePrompt = noteTypes.find(nt => nt.id.toString() === selectedNoteType)?.prompt || "";
  const { isRecording, isPaused, isProcessing, recordingTime, startRecording, pauseRecording, resumeRecording, stopRecording, cancelRecording } = useAudioRecording(
    (transcription: string) => {
      onContentChange(transcription);
    },
    selectedNotePrompt
  );

  // Actualizar el contenido del editor solo cuando cambie desde afuera
  useEffect(() => {
    if (editorRef.current && !isUpdatingFromProps) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== content) {
        setIsUpdatingFromProps(true);
        editorRef.current.innerHTML = content || '';
        setIsUpdatingFromProps(false);
      }
    }
  }, [content, isUpdatingFromProps]);

  const handleInput = () => {
    if (editorRef.current && !isUpdatingFromProps) {
      const newContent = editorRef.current.innerHTML;
      onContentChange(newContent);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado al portapapeles",
        description: "La nota SOAP ha sido copiada al portapapeles."
      });
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar la nota al portapapeles.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setShowPatientDialog(true);
  };

  const handlePatientSelected = async (patient: Patient) => {
    try {
      const medicoPacienteId = await createOrGetMedicoPacienteRelation(patient.id);
      await saveNote(content, medicoPacienteId, parseInt(selectedNoteType) || undefined);
      setShowPatientDialog(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleStartRecording = () => {
    try {
      console.log('📱 [Mobile Debug] Start recording button clicked:', {
        selectedNoteType,
        hasNoteType: !!selectedNoteType,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        timestamp: new Date().toISOString()
      });

      if (!selectedNoteType) {
        console.log('📱 [Mobile Debug] No note type selected, showing error');
        setShowNoteTypeError(true);
        toast({
          title: "Tipo de nota requerido",
          description: "Por favor selecciona un tipo de nota antes de grabar.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('📱 [Mobile Debug] Note type validation passed, showing consent dialog');
      setShowNoteTypeError(false);
      setShowConsentDialog(true);
    } catch (error) {
      console.error('📱 [Mobile Debug] Error in handleStartRecording:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        selectedNoteType,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      });
    }
  };

  const handleConsentConfirm = () => {
    if (consentChecked) {
      setShowConsentDialog(false);
      setConsentChecked(false);
      startRecording();
    }
  };

  const handleConsentCancel = () => {
    setShowConsentDialog(false);
    setConsentChecked(false);
  };

  return (
    <div className="space-y-4">
      {/* Botón de grabación de audio */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Button
                onClick={isRecording ? stopRecording : handleStartRecording}
                disabled={isLoading || isProcessing}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-full sm:w-auto min-w-[200px] max-w-[280px]"
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Detener grabación
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Procesando...' : 'Nueva consulta'}
                  </>
                )}
              </Button>
              
              {isRecording && (
                <>
                  <Button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    disabled={isLoading || isProcessing}
                    size="sm"
                    variant="secondary"
                    className="w-full sm:w-auto min-w-[120px] max-w-[200px]"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Reanudar
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={cancelRecording}
                    disabled={isLoading || isProcessing}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto min-w-[120px] max-w-[200px]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
            
            {/* Selector de tipo de nota */}
            <div className="w-full max-w-[280px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tipo de nota *
              </label>
              <Select 
                value={selectedNoteType} 
                onValueChange={(value) => {
                  try {
                    console.log('📱 [Mobile Debug] Note type selection started:', {
                      newValue: value,
                      previousValue: selectedNoteType,
                      isMobile: /Mobi|Android/i.test(navigator.userAgent),
                      timestamp: new Date().toISOString()
                    });
                    
                    setSelectedNoteType(value);
                    setShowNoteTypeError(false);
                    
                    console.log('📱 [Mobile Debug] Note type selection completed successfully:', {
                      newValue: value,
                      errorCleared: true
                    });
                  } catch (error) {
                    console.error('📱 [Mobile Debug] Error in note type selection:', {
                      error: error,
                      errorMessage: error instanceof Error ? error.message : 'Unknown error',
                      stack: error instanceof Error ? error.stack : undefined,
                      value: value,
                      isMobile: /Mobi|Android/i.test(navigator.userAgent)
                    });
                  }
                }}
                disabled={isRecording || isLoading || isProcessing || noteTypesLoading}
              >
                <SelectTrigger className={`w-full ${showNoteTypeError ? 'border-red-500 border-2' : ''}`}>
                  <SelectValue placeholder="Selecciona el tipo de nota" />
                </SelectTrigger>
                <SelectContent>
                  {noteTypes.map((noteType) => (
                    <SelectItem key={noteType.id} value={noteType.id.toString()}>
                      {noteType.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showNoteTypeError && (
                <p className="text-red-500 text-xs mt-1">
                  Debes seleccionar un tipo de nota
                </p>
              )}
            </div>
            
            {isRecording && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Grabando... Hable claramente cerca del micrófono
                </div>
                <div className="text-lg font-mono font-bold text-primary">
                  {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Procesando audio y generando nota...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor SOAP */}
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Resumen generado</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="outline" size="sm" disabled={!content || isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={handleCopyToClipboard} className="bg-blue-600 hover:bg-blue-700" size="sm" disabled={!content || isLoading}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            </div>
          </div>
          <EditorToolbar editorRef={editorRef} />
        </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center items-center min-h-[600px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Procesando nota SOAP...</p>
            </div>
          </div> : <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[600px] text-sm leading-relaxed p-3 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background"
            style={{ whiteSpace: 'pre-wrap' }}
            suppressContentEditableWarning={true}
          />}
        
        {content && !isLoading && <p className="text-xs text-muted-foreground mt-2">
            Puedes editar el texto directamente, incluyendo formato con negrita, cursiva, títulos, etc.
          </p>}
      </CardContent>
      </Card>

      {/* Diálogo de consentimiento */}
      <Dialog open={showConsentDialog} onOpenChange={handleConsentCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Consentimiento del Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor asegúrese de contar con el consentimiento del paciente antes de continuar.
            </p>
            <p className="text-sm font-medium">
              Ejemplo: "Voy a usar una herramienta digital de transcripción para ayudarme a generar un resumen de esta consulta, ¿me das tu consentimiento?"
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consent" 
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              />
              <label 
                htmlFor="consent" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                He obtenido el consentimiento del paciente
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={handleConsentCancel}
                variant="outline"
                className="min-w-[120px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConsentConfirm}
                disabled={!consentChecked}
                className="min-w-[120px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de selección de paciente */}
      <PatientSelectionDialog
        open={showPatientDialog}
        onOpenChange={setShowPatientDialog}
        onPatientSelected={handlePatientSelected}
      />
    </div>
  );
};
