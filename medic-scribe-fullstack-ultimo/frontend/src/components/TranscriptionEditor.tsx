
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EditorToolbar } from './EditorToolbar';
import { CheckCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranscriptionEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const TranscriptionEditor = ({ content, onContentChange }: TranscriptionEditorProps) => {
  const { toast } = useToast();
  const [isSigned, setIsSigned] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);

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
    if (editorRef.current && !isUpdatingFromProps && !isSigned) {
      const newContent = editorRef.current.innerHTML;
      onContentChange(newContent);
    }
  };

  const handleSign = () => {
    setIsSigned(true);
    toast({
      title: "Transcripción firmada",
      description: "La transcripción ha sido firmada y enviada al ERP de la clínica.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Cambios guardados",
      description: "Los cambios en la transcripción han sido guardados.",
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Transcripción de Consulta</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              variant="outline" 
              size="sm"
              disabled={isSigned || !content}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button 
              onClick={handleSign}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={isSigned || !content}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSigned ? 'Firmado' : 'Firmar'}
            </Button>
          </div>
        </div>
        <EditorToolbar editorRef={editorRef} />
      </CardHeader>
      <CardContent>
        <div 
          ref={editorRef}
          contentEditable={!isSigned}
          onInput={handleInput}
          className={`min-h-[600px] text-sm leading-relaxed p-3 border border-input rounded-md ${
            isSigned 
              ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
              : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background'
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
          suppressContentEditableWarning={true}
        />
        
        {isSigned && content && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Transcripción firmada y enviada al ERP</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Firmado por Dr. María Elena Rodríguez el {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        )}
        
        {!content && (
          <p className="text-xs text-muted-foreground mt-2">
            Inicie una grabación para generar la transcripción automáticamente.
          </p>
        )}
        
        {content && !isSigned && (
          <p className="text-xs text-muted-foreground mt-2">
            Puedes editar el texto directamente, incluyendo agregar o quitar títulos según sea necesario.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
