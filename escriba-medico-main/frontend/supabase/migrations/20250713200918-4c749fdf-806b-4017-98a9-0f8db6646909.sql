-- Add user_id column to paciente table
ALTER TABLE public.paciente ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL (all existing records will fail, but that's expected for new functionality)
-- We'll set a default temporarily for the migration, then remove it
UPDATE public.paciente SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE public.paciente ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Medicos can insert patients" ON public.paciente;
DROP POLICY IF EXISTS "Medicos can view their patients" ON public.paciente;

-- Create secure INSERT policy based on auth.uid()
CREATE POLICY "Users can insert their own patients" 
ON public.paciente 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create secure SELECT policy - users can only view their own patients
CREATE POLICY "Users can view their own patients" 
ON public.paciente 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create secure UPDATE policy - users can only update their own patients
CREATE POLICY "Users can update their own patients" 
ON public.paciente 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create secure DELETE policy - users can only delete their own patients
CREATE POLICY "Users can delete their own patients" 
ON public.paciente 
FOR DELETE 
USING (auth.uid() = user_id);