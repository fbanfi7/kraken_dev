-- Create tipo_nota table
CREATE TABLE public.tipo_nota (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tipo_nota ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read tipo_nota (since these are reference data)
CREATE POLICY "Anyone can view note types" 
ON public.tipo_nota 
FOR SELECT 
TO authenticated
USING (true);

-- Insert some default note types
INSERT INTO public.tipo_nota (descripcion) VALUES 
('Consulta General'),
('Consulta de Seguimiento'),
('Consulta de Emergencia'),
('Evaluación Pre-operatoria'),
('Control Post-operatorio'),
('Consulta Especializada');

-- Add foreign key constraint to existing nota_soap table
ALTER TABLE public.nota_soap 
ADD CONSTRAINT fk_tipo_nota_id 
FOREIGN KEY (tipo_nota_id) REFERENCES public.tipo_nota(id);