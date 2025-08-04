import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { usePatients, type Patient } from '@/hooks/usePatients';
import { useSOAPNotes } from '@/contexts/SOAPNotesContext';

interface DeletePatientDialogProps {
  patient: Patient;
  onDeleteSuccess?: () => void;
  asButton?: boolean;
}

export const DeletePatientDialog = ({ patient, onDeleteSuccess, asButton = false }: DeletePatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePatient } = usePatients();
  const { fetchNotes } = useSOAPNotes();

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deletePatient(patient.id);
    if (success) {
      fetchNotes(); // Refrescar las notas para actualizar la lista
      onDeleteSuccess?.();
      setOpen(false);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={asButton ? "text-destructive hover:text-destructive" : "w-full justify-start text-destructive hover:text-destructive"}
              onClick={() => setOpen(true)}
            >
              <Trash2 className={`h-4 w-4 ${asButton ? '' : 'mr-2'}`} />
              {!asButton && "Eliminar paciente"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar paciente</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{patient.nombre}</strong> y 
              <strong> todas sus notas médicas guardadas</strong>. 
              Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar paciente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};