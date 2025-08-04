import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
interface MedicalHeaderProps {
  currentTime: Date;
}
export const MedicalHeader = ({
  currentTime
}: MedicalHeaderProps) => {
  const {
    userProfile,
    user,
    signOut
  } = useAuth();
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };
  return <div className="space-y-4 w-full">
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, Doctor
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {userProfile?.nombre || user?.email || 'Sistema de Escriba Médico'}
          </p>
        </div>
        <div className="ml-4">
          <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
        
      </div>
    </div>;
};