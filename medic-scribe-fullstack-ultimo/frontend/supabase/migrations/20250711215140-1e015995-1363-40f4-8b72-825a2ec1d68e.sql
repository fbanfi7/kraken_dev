-- Update medico table to work with Supabase Auth
ALTER TABLE public.medico DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.medico ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create profiles table for medico data linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nota_soap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medico_paciente ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for medico (legacy table, keep for existing data)
CREATE POLICY "Medicos can view their own data" ON public.medico
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Medicos can update their own data" ON public.medico
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for nota_soap
CREATE POLICY "Medicos can view their own notes" ON public.nota_soap
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.profiles p ON p.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert their own notes" ON public.nota_soap
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.profiles p ON p.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can update their own notes" ON public.nota_soap
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.profiles p ON p.id = mp.medico_id
    WHERE mp.id = nota_soap.medico_paciente_id
    AND p.user_id = auth.uid()
  )
);

-- RLS policies for paciente
CREATE POLICY "Medicos can view their patients" ON public.paciente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medico_paciente mp
    JOIN public.profiles p ON p.id = mp.medico_id
    WHERE mp.paciente_id = paciente.id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert patients" ON public.paciente
FOR INSERT WITH CHECK (true);

-- RLS policies for medico_paciente
CREATE POLICY "Medicos can view their patient relationships" ON public.medico_paciente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = medico_paciente.medico_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Medicos can insert patient relationships" ON public.medico_paciente
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = medico_paciente.medico_id
    AND p.user_id = auth.uid()
  )
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nombre, especialidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.raw_user_meta_data->>'especialidad'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();