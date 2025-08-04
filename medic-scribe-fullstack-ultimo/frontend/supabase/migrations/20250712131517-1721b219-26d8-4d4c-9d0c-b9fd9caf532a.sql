-- Update medico table to be the primary user profile table
-- Remove password_hash if it exists and ensure user_id is properly set up
ALTER TABLE public.medico DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.medico ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.medico ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.medico ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update the handle_new_user function to insert into medico table instead of profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.medico (user_id, nombre, email, especialidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'especialidad'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for nota_soap to use medico table directly
DROP POLICY IF EXISTS "Medicos can view their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can insert their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can update their own notes" ON public.nota_soap;

CREATE POLICY "Medicos can view their own notes" ON public.nota_soap
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.medico m ON m.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert their own notes" ON public.nota_soap
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.medico m ON m.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can update their own notes" ON public.nota_soap
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.medico m ON m.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND m.user_id = auth.uid()
  )
);

-- Update RLS policies for paciente to use medico table directly
DROP POLICY IF EXISTS "Medicos can view their patients" ON public.paciente;

CREATE POLICY "Medicos can view their patients" ON public.paciente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.medico m ON m.id = mp.medico_id
    WHERE mp.paciente_id = paciente.id
    AND m.user_id = auth.uid()
  )
);

-- Update RLS policies for medico_paciente to use medico table directly
DROP POLICY IF EXISTS "Medicos can view their patient relationships" ON public.medico_paciente;
DROP POLICY IF EXISTS "Medicos can insert patient relationships" ON public.medico_paciente;

CREATE POLICY "Medicos can view their patient relationships" ON public.medico_paciente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medico m
    WHERE m.id = medico_paciente.medico_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert patient relationships" ON public.medico_paciente
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.medico m
    WHERE m.id = medico_paciente.medico_id
    AND m.user_id = auth.uid()
  )
);

-- Add trigger for updating timestamps on medico table
CREATE TRIGGER update_medico_updated_at
  BEFORE UPDATE ON public.medico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();