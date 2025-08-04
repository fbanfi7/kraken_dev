-- Update RLS policies for nota_soap using the corrected approach
DROP POLICY IF EXISTS "Medicos can view their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can insert their own notes" ON public.nota_soap;
DROP POLICY IF EXISTS "Medicos can update their own notes" ON public.nota_soap;

CREATE POLICY "Medicos can view their own notes" 
ON public.nota_soap 
FOR SELECT 
USING (
  nota_soap.medico_paciente_id IN (
    SELECT mp.id FROM medico_paciente mp
    WHERE mp.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert their own notes" 
ON public.nota_soap 
FOR INSERT 
WITH CHECK (
  nota_soap.medico_paciente_id IN (
    SELECT mp.id FROM medico_paciente mp
    WHERE mp.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can update their own notes" 
ON public.nota_soap 
FOR UPDATE 
USING (
  nota_soap.medico_paciente_id IN (
    SELECT mp.id FROM medico_paciente mp
    WHERE mp.user_id = auth.uid()
  )
);