
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Type } from 'lucide-react';

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
}

export const EditorToolbar = ({ editorRef }: EditorToolbarProps) => {
  const handleFormatting = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false);
    }
  };

  return (
    <div className="flex gap-1 p-2 bg-muted rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatting('bold')}
        className="h-8 w-8 p-0"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatting('italic')}
        className="h-8 w-8 p-0"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatting('underline')}
        className="h-8 w-8 p-0"
      >
        <Underline className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFormatting('formatBlock')}
        className="h-8 w-8 p-0"
      >
        <Type className="w-4 h-4" />
      </Button>
    </div>
  );
};
