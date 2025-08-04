-- Create trigger to automatically create medico record when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert medico record for existing users who don't have one
INSERT INTO public.medico (user_id, nombre, email, especialidad)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nombre', 'Usuario'),
  u.email,
  u.raw_user_meta_data->>'especialidad'
FROM auth.users u
LEFT JOIN public.medico m ON m.user_id = u.id
WHERE m.id IS NULL;