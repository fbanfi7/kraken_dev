import { Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
interface ProcessingMetricsProps {
  processingTime: string;
}
export const ProcessingMetrics = ({
  processingTime
}: ProcessingMetricsProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Tiempo de procesamiento: {processingTime}
        </span>
      </div>
    </Card>
  );
};