import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Stethoscope } from 'lucide-react';

const MEDICAL_SPECIALTIES = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Ortopedia",
  "Otorrinolaringología",
  "Pediatría",
  "Psiquiatría",
  "Radiología",
  "Urología",
  "Anestesiología",
  "Cirugía General",
  "Medicina Interna",
  "Oncología",
  "Traumatología",
  "Medicina de Emergencia"
];

interface AuthPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AuthPage = ({ theme, onToggleTheme }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    medicalSpecialty: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();
     // HACK: bypass login local
  if (window.location.hostname === 'localhost') {
    return null;
  }
 	

  // Check if we're in a password reset flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'recovery') {
      setShowResetPassword(true);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Error de autenticación",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de vuelta",
        });
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.medicalSpecialty) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup with:', {
        email: formData.email,
        metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          medical_specialty: formData.medicalSpecialty,
        }
      });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            medical_specialty: formData.medicalSpecialty,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Signup successful:', data);
        toast({
          title: "Registro exitoso",
          description: data.user?.email_confirmed_at 
            ? "¡Cuenta creada exitosamente! Ya puedes iniciar sesión."
            : "Verifica tu email para completar el registro",
        });
        
        // If email is auto-confirmed, switch to login mode
        if (data.user?.email_confirmed_at) {
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Signup exception:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/?type=recovery`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Revisa tu email para restablecer tu contraseña",
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente",
        });
        setShowResetPassword(false);
        setNewPassword('');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-6">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {showForgotPassword ? 'Recuperar Contraseña' : 
               showResetPassword ? 'Nueva Contraseña' :
               isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <p className="text-muted-foreground">
              {showForgotPassword ? 'Ingresa tu email para recuperar tu contraseña' :
               showResetPassword ? 'Ingresa tu nueva contraseña' :
               isLogin ? 'Accede a tu cuenta médica' : 'Únete a nuestra plataforma médica'}
            </p>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm"
                  >
                    Volver al inicio de sesión
                  </Button>
                </div>
              </form>
            ) : showResetPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </form>
            ) : (
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="Tu nombre"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="pl-10"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Tu apellido"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="pl-10"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalSpecialty">Especialidad Médica</Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                          id="medicalSpecialty"
                          value={formData.medicalSpecialty}
                          onChange={(e) => handleInputChange('medicalSpecialty', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required={!isLogin}
                        >
                          <option value="">Selecciona tu especialidad</option>
                          {MEDICAL_SPECIALTIES.map((specialty) => (
                            <option key={specialty} value={specialty}>
                              {specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </Button>
              </form>
            )}

            {isLogin && !showForgotPassword && !showResetPassword && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-muted-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            )}

            {!showForgotPassword && !showResetPassword && (
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
