
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranscriptionSectionProps {
  section: {
    id: string;
    title: string;
    content: string;
  };
  onContentChange: (id: string, content: string) => void;
  disabled?: boolean;
}

export const TranscriptionSection = ({ section, onContentChange, disabled = false }: TranscriptionSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(section.id, e.target.value);
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-primary">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            value={section.content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[100px] p-3 text-sm border rounded-md resize-vertical bg-background text-foreground"
            autoFocus
          />
        ) : (
          <div
            className={`text-sm leading-relaxed p-3 rounded-md cursor-text min-h-[60px] ${
              disabled 
                ? 'bg-muted/30 text-muted-foreground' 
                : 'hover:bg-muted/50 transition-colors'
            }`}
            onDoubleClick={handleDoubleClick}
          >
            {section.content}
          </div>
        )}
        {!disabled && !isEditing && (
          <p className="text-xs text-muted-foreground mt-2">
            Doble clic para editar
          </p>
        )}
      </CardContent>
    </Card>
  );
};
