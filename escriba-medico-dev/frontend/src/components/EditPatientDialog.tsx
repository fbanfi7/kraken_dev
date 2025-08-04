import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePatients, type Patient } from '@/hooks/usePatients';
import { useSOAPNotes } from '@/contexts/SOAPNotesContext';
import { DeletePatientDialog } from '@/components/DeletePatientDialog';

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export const EditPatientDialog = ({ open, onOpenChange, patient }: EditPatientDialogProps) => {
  const [formData, setFormData] = useState({
    nombre: patient?.nombre || '',
    documento: patient?.documento || '',
    sexo: patient?.sexo || '',
    cobertura: patient?.cobertura || '',
    numero_telefono: patient?.numero_telefono || '',
  });

  // Actualizar formData cuando cambie el paciente
  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        documento: patient.documento || '',
        sexo: patient.sexo || '',
        cobertura: patient.cobertura || '',
        numero_telefono: patient.numero_telefono || '',
      });
    }
  }, [patient]);

  const { updatePatient } = usePatients();
  const { fetchNotes } = useSOAPNotes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      documento: formData.documento || undefined,
      sexo: formData.sexo || undefined,
      cobertura: formData.cobertura || undefined,
      numero_telefono: formData.numero_telefono || undefined,
    };

    const result = await updatePatient(patient.id, updates);
    if (result) {
      fetchNotes(); // Refrescar las notas para actualizar la información del paciente
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
              placeholder="DNI, Pasaporte, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={formData.sexo}
              onValueChange={(value) => setFormData({ ...formData, sexo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cobertura">Cobertura médica</Label>
            <Input
              id="cobertura"
              value={formData.cobertura}
              onChange={(e) => setFormData({ ...formData, cobertura: e.target.value })}
              placeholder="Obra social, prepaga, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_telefono">Número de teléfono</Label>
            <Input
              id="numero_telefono"
              type="tel"
              value={formData.numero_telefono}
              onChange={(e) => setFormData({ ...formData, numero_telefono: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};