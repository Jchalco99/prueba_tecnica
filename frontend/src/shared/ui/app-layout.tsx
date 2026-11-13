import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  HardHat,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import * as React from 'react';
import {
  getUserInitials,
  type User,
} from '@/entities/user/model/types';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';

interface AppLayoutProps {
  user: User;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'flota_sidebar_collapsed';

export function AppLayout({
  user,
  darkMode,
  onToggleDarkMode,
  onLogout,
  children,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      }
      return next;
    });
  };

  const isAdmin = user.role === 'ADMIN';

  // Contenido de navegación para escritorio
  const DesktopSidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4">
        {/* Cabecera del sidebar */}
        <div
          className={`flex items-center gap-2.5 px-2 py-1.5 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/25">
              <HardHat className="size-5" aria-hidden="true" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold tracking-tight text-foreground truncate">
                  FLOTA MINERA
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Control Preventivo
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
            aria-label={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Rol badge */}
        {!collapsed ? (
          <div className="px-2">
            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldCheck className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="truncate">Administrador</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                <UserIcon className="size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span className="truncate">Operador</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {isAdmin ? (
              <div
                className="flex size-8 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                title="Rol: Administrador"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
              </div>
            ) : (
              <div
                className="flex size-8 items-center justify-center rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
                title="Rol: Operador"
              >
                <UserIcon className="size-4" aria-hidden="true" />
              </div>
            )}
          </div>
        )}

        {/* Menu item */}
        <nav aria-label="Navegación principal" className="space-y-1 px-1">
          <div
            className={`flex items-center gap-3 rounded-md bg-blue-500/15 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-xs ${
              collapsed ? 'justify-center p-2' : 'px-3 py-2.5'
            }`}
            title={isAdmin ? 'Flota de Equipos' : 'Mis Equipos'}
          >
            <Boxes className="size-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            {!collapsed && (
              <span className="truncate">
                {isAdmin ? 'Flota de Equipos' : 'Mis Equipos'}
              </span>
            )}
          </div>
        </nav>
      </div>

      {/* Pie del sidebar: Modo oscuro + Usuario + Logout */}
      <div className="border-t p-2 space-y-2">
        {/* Toggle modo oscuro dentro del sidebar */}
        {!collapsed ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleDarkMode}
            aria-pressed={darkMode}
            className="w-full justify-start gap-2.5 px-2.5 h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            {darkMode ? (
              <Sun className="size-4 text-amber-500" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
            <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          </Button>
        ) : (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              aria-pressed={darkMode}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              {darkMode ? (
                <Sun className="size-4 text-amber-500" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}

        {/* Informacion de usuario y cerrar sesion */}
        <div
          className={`flex items-center rounded-md bg-muted/40 p-1.5 ${
            collapsed ? 'flex-col gap-2 justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 font-mono text-xs font-bold text-white shadow-xs">
                {getUserInitials(user.nombre)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 max-w-[120px] truncate text-xs">
                <p className="font-medium text-foreground truncate">{user.nombre}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Cerrar sesion"
            aria-label="Cerrar sesion"
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Contenido de navegación para movil
  const MobileSidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/25">
            <HardHat className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-tight text-foreground">
              FLOTA MINERA
            </div>
            <div className="text-[11px] text-muted-foreground">
              Control Preventivo
            </div>
          </div>
        </div>

        <div className="px-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <ShieldCheck className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Administrador</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <UserIcon className="size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Operador</span>
            </div>
          )}
        </div>

        <nav aria-label="Navegación móvil" className="space-y-1 px-1">
          <div className="flex items-center gap-3 rounded-md bg-blue-500/15 px-3 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-xs">
            <Boxes className="size-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>{isAdmin ? 'Flota de Equipos' : 'Mis Equipos'}</span>
          </div>
        </nav>
      </div>

      <div className="border-t p-3 space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleDarkMode}
          aria-pressed={darkMode}
          className="w-full justify-start gap-2.5 h-10 text-xs text-foreground"
        >
          {darkMode ? (
            <Sun className="size-4 text-amber-500" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
          <span>{darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}</span>
        </Button>

        <div className="flex items-center justify-between rounded-md bg-muted/40 p-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 font-mono text-xs font-bold text-white shadow-xs">
                {getUserInitials(user.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 max-w-[140px] truncate text-xs">
              <p className="font-medium text-foreground truncate">{user.nombre}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Cerrar sesion"
            aria-label="Cerrar sesion"
            className="size-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Sidebar de escritorio fijo */}
      <aside
        className={`hidden shrink-0 border-r bg-card transition-all duration-200 md:block ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="sticky top-0 h-dvh p-2">
          {DesktopSidebarContent}
        </div>
      </aside>

      {/* Área de contenido sin header/navbar en escritorio */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barra móvil únicamente para pantallas pequeñas */}
        <div className="flex h-12 items-center justify-between border-b bg-card px-4 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                aria-label="Abrir menu de navegacion"
              >
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-3">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de navegacion</SheetTitle>
              </SheetHeader>
              {MobileSidebarContent}
            </SheetContent>
          </Sheet>

          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            FLOTA MINERA
          </span>

          <Avatar className="size-7">
            <AvatarFallback className="bg-primary font-mono text-xs font-semibold text-primary-foreground">
              {getUserInitials(user.nombre)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Contenido principal limpio sin header superior */}
        <main id="contenido-principal" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
