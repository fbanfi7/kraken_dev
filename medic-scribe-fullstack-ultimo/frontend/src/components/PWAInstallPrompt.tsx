import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (!success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-slide-up shadow-lg md:left-auto md:right-4 md:mx-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Instalar App
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Instala ScribeDash en tu dispositivo para acceso rápido y offline
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={handleInstall}
          size="sm"
          className="w-full"
        >
          Instalar
        </Button>
      </CardContent>
    </Card>
  );
};