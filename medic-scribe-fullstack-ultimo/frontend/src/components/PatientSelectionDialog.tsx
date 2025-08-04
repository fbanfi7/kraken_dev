import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePatients, Patient, NewPatient } from '@/hooks/usePatients';
import { Plus, User } from 'lucide-react';

interface PatientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelected: (patient: Patient) => void;
}

export const PatientSelectionDialog = ({
  open,
  onOpenChange,
  onPatientSelected
}: PatientSelectionDialogProps) => {
  const { patients, loading, createPatient } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newPatient, setNewPatient] = useState<NewPatient>({
    nombre: '',
    documento: '',
    sexo: '',
    cobertura: '',
    numero_telefono: ''
  });
  const [creating, setCreating] = useState(false);

  const handleSelectPatient = () => {
    if (selectedPatientId === 'create-new') {
      setShowCreateForm(true);
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (patient) {
      onPatientSelected(patient);
      resetDialog();
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.nombre.trim()) return;

    setCreating(true);
    const createdPatient = await createPatient(newPatient);
    setCreating(false);

    if (createdPatient) {
      onPatientSelected(createdPatient);
      resetDialog();
    }
  };

  const resetDialog = () => {
    setSelectedPatientId("");
    setShowCreateForm(false);
    setNewPatient({
      nombre: '',
      documento: '',
      sexo: '',
      cobertura: '',
      numero_telefono: ''
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (showCreateForm) {
      setShowCreateForm(false);
      setSelectedPatientId("");
    } else {
      resetDialog();
    }
  };


  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {showCreateForm ? 'Crear nuevo paciente' : 'Seleccionar paciente'}
          </DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-select">Paciente</Label>
              <Select 
                value={selectedPatientId} 
                onValueChange={setSelectedPatientId}
                disabled={loading}
              >
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nombre}
                      {patient.documento && ` (${patient.documento})`}
                    </SelectItem>
                  ))}
                  <SelectItem value="create-new">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Crear nuevo paciente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetDialog}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSelectPatient}
                disabled={!selectedPatientId || loading}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={newPatient.nombre}
                  onChange={(e) => setNewPatient({ ...newPatient, nombre: e.target.value })}
                  placeholder="Nombre completo del paciente"
                />
              </div>
              
              <div>
                <Label htmlFor="documento">Documento</Label>
                <Input
                  id="documento"
                  value={newPatient.documento}
                  onChange={(e) => setNewPatient({ ...newPatient, documento: e.target.value })}
                  placeholder="DNI/CI/Pasaporte"
                />
              </div>
              
              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={newPatient.sexo} onValueChange={(value) => setNewPatient({ ...newPatient, sexo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={newPatient.numero_telefono}
                  onChange={(e) => setNewPatient({ ...newPatient, numero_telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              
              <div>
                <Label htmlFor="cobertura">Cobertura médica</Label>
                <Input
                  id="cobertura"
                  value={newPatient.cobertura}
                  onChange={(e) => setNewPatient({ ...newPatient, cobertura: e.target.value })}
                  placeholder="Obra social/Prepaga"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Atrás
              </Button>
              <Button 
                onClick={handleCreatePatient}
                disabled={!newPatient.nombre.trim() || creating}
              >
                {creating ? 'Creando...' : 'Crear paciente'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};