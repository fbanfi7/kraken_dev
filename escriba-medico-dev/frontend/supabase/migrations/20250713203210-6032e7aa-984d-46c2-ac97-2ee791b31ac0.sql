-- Fix the handle_new_user function to properly capture first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.medico (user_id, nombre, email, especialidad)
  VALUES (
    NEW.id,
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'medical_specialty'
  );
  RETURN NEW;
END;
$$;

-- Add user_id column to medico_paciente table for easier SOAP note queries
ALTER TABLE public.medico_paciente ADD COLUMN user_id UUID;

-- Update existing records to populate user_id
UPDATE public.medico_paciente 
SET user_id = m.user_id 
FROM public.medico m 
WHERE m.id = medico_paciente.medico_id;

-- Make user_id NOT NULL after populating existing records
ALTER TABLE public.medico_paciente ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies for nota_soap to use the new user_id column
DROP POLICY IF EXISTS "Medicos can view their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can insert their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can update their own notes" ON public.nota_soap;

CREATE POLICY "Medicos can view their own notes" 
ON public.nota_soap 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM medico_paciente mp 
  WHERE mp.id = nota_soap.medico_paciente_id 
  AND mp.user_id = auth.uid()
));

CREATE POLICY "Medicos can insert their own notes" 
ON public.nota_soap 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM medico_paciente mp 
  WHERE mp.id = nota_soap.medico_paciente_id 
  AND mp.user_id = auth.uid()
));

CREATE POLICY "Medicos can update their own notes" 
ON public.nota_soap 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 
  FROM medico_paciente mp 
  WHERE mp.id = nota_soap.medico_paciente_id 
  AND mp.user_id = auth.uid()
));