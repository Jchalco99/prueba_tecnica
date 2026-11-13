import {
  AlertCircle,
  KeyRound,
  LogIn,
  Moon,
  ShieldCheck,
  Sun,
  UserPlus,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/entities/user/api/auth.api';
import type { AuthSession } from '@/entities/user/model/types';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

export function AuthPage({
  darkMode,
  onToggleDarkMode,
  onAuthenticated,
}: AuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  const [registerNombre, setRegisterNombre] = React.useState('');
  const [registerEmail, setRegisterEmail] = React.useState('');
  const [registerPassword, setRegisterPassword] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [adminDialogOpen, setAdminDialogOpen] = React.useState(false);

  const handleModeChange = (value: string) => {
    setMode(value as AuthMode);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const email = loginEmail.trim().toLowerCase();
    if (!email || !loginPassword) {
      setError('Ingresa tu correo electronico y contrasena para continuar.');
      return;
    }

    try {
      setSubmitting(true);
      const session = await authApi.login({
        email,
        password: loginPassword,
      });
      onAuthenticated(session);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesion. Verifica tus credenciales.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nombre = registerNombre.trim();
    const email = registerEmail.trim().toLowerCase();

    if (nombre.length < 2) {
      setError('Ingresa tu nombre completo (minimo 2 caracteres).');
      return;
    }
    if (!email) {
      setError('Ingresa un correo electronico valido.');
      return;
    }
    if (registerPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      const session = await authApi.register({
        nombre,
        email,
        password: registerPassword,
      });
      onAuthenticated(session);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la cuenta.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    setAdminDialogOpen(false);
    setMode('login');
    setLoginEmail('admin@minera.com');
    setLoginPassword('admin123');
    setError(null);

    try {
      setSubmitting(true);
      const session = await authApi.login({
        email: 'admin@minera.com',
        password: 'admin123',
      });
      onAuthenticated(session);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo ingresar con la cuenta administrador.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background">
      {/* Botones de utilidad flotantes en la esquina inferior derecha */}
      <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2">
        {/* Acceso de Administrador discreto en modal para no ensuciar la tarjeta */}
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 rounded-full border-amber-500/40 bg-amber-500/15 px-3.5 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-md hover:bg-amber-500/25"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span>Cuenta Demo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <DialogTitle>Cuenta Administrador</DialogTitle>
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                >
                  ADMIN
                </Badge>
              </div>
              <DialogDescription>
                Accede a toda la flota general registrada en el sistema por todos los operadores.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correo:</span>
                <span className="font-semibold text-foreground">admin@minera.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clave:</span>
                <span className="font-semibold text-foreground">admin123</span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-xs"
              onClick={handleAdminQuickLogin}
              disabled={submitting}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              <span>Entrar como administrador</span>
            </Button>
          </DialogContent>
        </Dialog>

        {/* Boton de modo oscuro/claro */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
          aria-pressed={darkMode}
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="size-10 rounded-full bg-card shadow-md"
        >
          {darkMode ? (
            <Sun className="size-4 text-amber-500" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <main id="contenido-principal" className="w-full max-w-sm space-y-6">
        {/* Titulo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Acceso al sistema
          </h1>
        </div>

        <Card className="shadow-xs pb-3">
          <CardHeader className="pb-2">
            <Tabs
              value={mode}
              onValueChange={handleModeChange}
              className="w-full"
            >
              <TabsList className="grid h-11 w-full grid-cols-2">
                <TabsTrigger value="login" className="min-h-9 gap-1.5">
                  <LogIn className="size-4" aria-hidden="true" />
                  <span>Iniciar sesion</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="min-h-9 gap-1.5">
                  <UserPlus className="size-4" aria-hidden="true" />
                  <span>Crear cuenta</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert
                  role="alert"
                  variant="destructive"
                  className="mt-4 border-alert-border bg-alert-surface text-alert-foreground"
                >
                  <AlertCircle aria-hidden="true" />
                  <AlertDescription className="text-alert-foreground">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="mt-4 space-y-4">
                <CardTitle className="text-base">
                  Ingresa con tu cuenta
                </CardTitle>

                <form
                  onSubmit={handleLoginSubmit}
                  className="grid gap-4"
                  noValidate
                >
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Correo electronico</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="operador@minera.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      className="min-h-11 sm:min-h-9"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="login-password">Contrasena</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Ingresa tu contrasena"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      className="min-h-11 sm:min-h-9"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="min-h-11 w-full sm:min-h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xs shadow-blue-500/20"
                    disabled={submitting}
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    <span>
                      {submitting ? 'Verificando acceso...' : 'Ingresar al panel'}
                    </span>
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-4 space-y-4">
                <CardTitle className="text-base">
                  Registro de nuevo operador
                </CardTitle>

                <form
                  onSubmit={handleRegisterSubmit}
                  className="grid gap-4"
                  noValidate
                >
                  <div className="grid gap-2">
                    <Label htmlFor="register-nombre">Nombre completo</Label>
                    <Input
                      id="register-nombre"
                      name="nombre"
                      type="text"
                      placeholder="Nombre y apellido"
                      value={registerNombre}
                      onChange={(e) => setRegisterNombre(e.target.value)}
                      autoComplete="name"
                      className="min-h-11 sm:min-h-9"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Correo electronico</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="operador@minera.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      autoComplete="email"
                      className="min-h-11 sm:min-h-9"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Contrasena</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="Minimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      autoComplete="new-password"
                      className="min-h-11 sm:min-h-9"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="min-h-11 w-full sm:min-h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xs shadow-blue-500/20"
                    disabled={submitting}
                  >
                    <UserPlus className="size-4" aria-hidden="true" />
                    <span>
                      {submitting
                        ? 'Creando cuenta...'
                        : 'Crear cuenta de operador'}
                    </span>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
