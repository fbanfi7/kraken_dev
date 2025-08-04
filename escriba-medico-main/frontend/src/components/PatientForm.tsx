import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const patientSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  dni: z.string().min(1, 'El DNI es requerido'),
  cobertura_medica: z.string().optional(),
  numero_telefono: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated: () => void;
}

export const PatientForm = ({ open, onOpenChange, onPatientCreated }: PatientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      cobertura_medica: '',
      numero_telefono: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debe estar autenticado para crear un paciente',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Primero obtener el médico asociado al usuario
      const { data: medico, error: medicoError } = await supabase
        .from('medico')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (medicoError || !medico) {
        throw new Error('Médico no encontrado');
      }

      // Crear el paciente
      const { data: newPatient, error: patientError } = await supabase
        .from('paciente')
        .insert({
          nombre: `${data.nombre} ${data.apellido}`,
          documento: data.dni,
          sexo: null,
          cobertura: data.cobertura_medica || null,
          numero_telefono: data.numero_telefono || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Crear la relación medico_paciente
      const { error: relationError } = await supabase
        .from('medico_paciente')
        .insert({
          medico_id: medico.id,
          paciente_id: newPatient.id,
          user_id: user.id,
        });

      if (relationError) throw relationError;

      toast({
        title: 'Éxito',
        description: 'Paciente creado correctamente',
      });

      form.reset();
      onOpenChange(false);
      onPatientCreated();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el paciente',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Complete los datos del paciente para agregarlo a su lista.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el DNI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cobertura_medica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cobertura Médica</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese la cobertura médica (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el número de teléfono (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Paciente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};