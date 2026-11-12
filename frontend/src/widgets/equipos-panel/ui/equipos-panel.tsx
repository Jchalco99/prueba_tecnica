import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import * as React from 'react';
import {
  type CreateEquipoInput,
  type Equipo,
  getCicloMantenimientoInfo,
  INTERVALO_POR_TIPO,
  TIPO_EQUIPO_LABEL,
  TIPOS_EQUIPO,
  type TipoEquipo,
  type UpdateEquipoInput,
} from '@/entities/equipo/model/types';
import { EstadoMantenimientoBadge } from '@/entities/equipo/ui/estado-mantenimiento-badge';
import { EquipoCreateDialog } from '@/features/equipo-create/ui/equipo-create-dialog';
import { EquipoEditDialog } from '@/features/equipo-edit/ui/equipo-edit-dialog';
import { MantenimientoHistoryDialog } from '@/features/mantenimiento-history/ui/mantenimiento-history-dialog';
import { RegistrarMantenimientoButton } from '@/features/mantenimiento-register/ui/registrar-mantenimiento-button';
import { formatFecha } from '@/shared/lib/format-date';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type FiltroEstado = 'TODOS' | 'ALERTA' | 'OPERATIVO';
type FiltroTipo = 'TODOS' | TipoEquipo;

interface EquiposPanelProps {
  equipos: Equipo[];
  loading: boolean;
  error: string | null;
  feedback: { type: 'ok' | 'error'; text: string } | null;
  feedbackKey?: number;
  recentlyCreatedId?: number | null;
  recentlyMaintainedId?: number | null;
  onRetry: () => Promise<void>;
  onCreate: (input: CreateEquipoInput) => Promise<void>;
  onUpdate: (id: number, input: UpdateEquipoInput) => Promise<void>;
  onDelete: (equipo: Equipo) => Promise<void>;
  onRegisterMantenimiento: (equipoId: number) => Promise<void>;
}

function getEquipoAnimationClass(
  equipoId: number,
  recentlyCreatedId?: number | null,
  recentlyMaintainedId?: number | null,
): string {
  if (equipoId === recentlyMaintainedId) {
    return 'animate-mantenimiento-done';
  }
  if (equipoId === recentlyCreatedId) {
    return 'animate-equipo-created';
  }
  return '';
}

export function EquiposPanel({
  equipos,
  loading,
  error,
  feedback,
  feedbackKey,
  recentlyCreatedId,
  recentlyMaintainedId,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  onRegisterMantenimiento,
}: EquiposPanelProps) {
  const [filtroEstado, setFiltroEstado] = React.useState<FiltroEstado>('TODOS');
  const [filtroTipo, setFiltroTipo] = React.useState<FiltroTipo>('TODOS');
  const [busqueda, setBusqueda] = React.useState('');
  const [equipoToDelete, setEquipoToDelete] = React.useState<Equipo | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const totalEquipos = equipos.length;
  const totalEnAlerta = equipos.filter((e) => e.requiereMantenimiento).length;
  const totalOperativos = totalEquipos - totalEnAlerta;

  const equiposFiltrados = React.useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return equipos.filter((equipo) => {
      if (filtroEstado === 'ALERTA' && !equipo.requiereMantenimiento) {
        return false;
      }
      if (filtroEstado === 'OPERATIVO' && equipo.requiereMantenimiento) {
        return false;
      }
      if (filtroTipo !== 'TODOS' && equipo.tipo !== filtroTipo) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        equipo.codigo.toLowerCase().includes(query) ||
        TIPO_EQUIPO_LABEL[equipo.tipo].toLowerCase().includes(query) ||
        equipo.tipo.toLowerCase().includes(query)
      );
    });
  }, [equipos, filtroEstado, filtroTipo, busqueda]);

  const confirmDelete = async () => {
    if (!equipoToDelete) {
      return;
    }
    const target = equipoToDelete;
    try {
      setDeletingId(target.id);
      await onDelete(target);
      setEquipoToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Equipos mineros
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Actualizar</span>
          </Button>
          <EquipoCreateDialog onCreate={onCreate} triggerLabel="Nuevo equipo" />
        </div>
      </div>

      {feedback && (
        <Alert
          key={feedbackKey}
          role="status"
          aria-live="polite"
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          className={`animate-feedback-in ${
            feedback.type === 'error'
              ? 'border-alert-border bg-alert-surface text-alert-foreground'
              : 'border-ok-border bg-ok-surface text-ok-foreground'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          <AlertDescription
            className={
              feedback.type === 'error'
                ? 'font-medium text-alert-foreground'
                : 'font-medium text-ok-foreground'
            }
          >
            {feedback.text}
          </AlertDescription>
        </Alert>
      )}

      <Card className="gap-4 shadow-xs">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="buscar-equipo"
                  aria-label="Buscar equipo por código o tipo"
                  type="search"
                  placeholder="Buscar código o tipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={filtroTipo}
                onValueChange={(value) => setFiltroTipo(value as FiltroTipo)}
              >
                <SelectTrigger
                  aria-label="Filtrar por tipo de equipo"
                  className="w-full sm:w-48"
                >
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los tipos</SelectItem>
                  {TIPOS_EQUIPO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {TIPO_EQUIPO_LABEL[tipo]} ({INTERVALO_POR_TIPO[tipo]} h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs
              value={filtroEstado}
              onValueChange={(value) => setFiltroEstado(value as FiltroEstado)}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 lg:inline-flex lg:w-auto">
                <TabsTrigger value="TODOS" className="gap-1.5 px-3">
                  <span>Todos</span>
                  {loading ? (
                    <Skeleton className="h-5 w-6" />
                  ) : (
                    <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[11px]">
                      {totalEquipos}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ALERTA" className="gap-1.5 px-3">
                  <span>Alerta</span>
                  {loading ? (
                    <Skeleton className="h-5 w-6" />
                  ) : (
                    <Badge
                      variant={totalEnAlerta > 0 ? 'destructive' : 'secondary'}
                      className="h-5 px-1.5 font-mono text-[11px]"
                    >
                      {totalEnAlerta}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="OPERATIVO" className="gap-1.5 px-3">
                  <span>En rango</span>
                  {loading ? (
                    <Skeleton className="h-5 w-6" />
                  ) : (
                    <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[11px]">
                      {totalOperativos}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div role="status" aria-live="polite">
              <span className="sr-only">
                Consultando registro de equipos y horómetros...
              </span>
              <div className="hidden overflow-hidden rounded-md border lg:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-3">Código</TableHead>
                      <TableHead className="px-3">Tipo</TableHead>
                      <TableHead className="px-3">Horómetro</TableHead>
                      <TableHead className="px-3">Ciclo preventivo</TableHead>
                      <TableHead className="px-3 text-center">Estado</TableHead>
                      <TableHead className="px-3">Último servicio</TableHead>
                      <TableHead className="px-3 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="hover:bg-transparent">
                        <TableCell className="px-3 py-3.5">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="px-3 py-3.5">
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="min-w-44 px-3 py-3.5">
                          <div className="space-y-2">
                            <div className="flex justify-between gap-4">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <Skeleton className="mx-auto size-7 rounded-full" />
                        </TableCell>
                        <TableCell className="px-3 py-3.5">
                          <Skeleton className="h-3.5 w-28" />
                        </TableCell>
                        <TableCell className="px-3 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Skeleton className="size-8" />
                            <Skeleton className="size-8" />
                            <Skeleton className="size-8" />
                            <Skeleton className="size-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="gap-4 py-4 shadow-xs">
                    <CardContent className="space-y-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                        <Skeleton className="size-7 rounded-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-3">
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 border-t px-4 pt-3">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : error ? (
            <Alert
              variant="destructive"
              className="border-alert-border bg-alert-surface p-5 text-alert-foreground"
            >
              <AlertCircle aria-hidden="true" />
              <AlertTitle className="font-semibold text-alert-foreground">
                No se pudo cargar el listado de equipos
              </AlertTitle>
              <AlertDescription className="mt-1 text-alert-foreground">
                <p>{error}</p>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-card text-foreground"
                    onClick={onRetry}
                  >
                    <RefreshCw aria-hidden="true" />
                    <span>Reintentar conexión</span>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-md border lg:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-3">Código</TableHead>
                      <TableHead className="px-3">Tipo</TableHead>
                      <TableHead className="px-3">Horómetro</TableHead>
                      <TableHead className="px-3">Ciclo preventivo</TableHead>
                      <TableHead className="px-3 text-center">Estado</TableHead>
                      <TableHead className="px-3">Último servicio</TableHead>
                      <TableHead className="px-3 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equiposFiltrados.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={7}
                          className="h-28 text-center text-sm text-muted-foreground"
                        >
                          {equipos.length === 0 ? (
                            <span>Sin datos.</span>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span>Sin resultados para los filtros aplicados.</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setFiltroEstado('TODOS');
                                  setFiltroTipo('TODOS');
                                  setBusqueda('');
                                }}
                              >
                                Limpiar filtros
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      equiposFiltrados.map((equipo) => {
                        const ciclo = getCicloMantenimientoInfo(equipo);
                        const animClass = getEquipoAnimationClass(
                          equipo.id,
                          recentlyCreatedId,
                          recentlyMaintainedId,
                        );
                        return (
                          <TableRow
                            key={equipo.id}
                            className={`${
                              equipo.requiereMantenimiento
                                ? 'bg-alert-surface/35 hover:bg-alert-surface/55'
                                : ''
                            } ${animClass}`.trim()}
                          >
                            <TableCell className="px-3 py-3 font-mono text-sm font-semibold">
                              {equipo.codigo}
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              <div className="text-sm font-medium text-foreground">
                                {TIPO_EQUIPO_LABEL[equipo.tipo]}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Cada {INTERVALO_POR_TIPO[equipo.tipo]} h
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-3 font-mono text-sm font-semibold tabular-nums">
                              {equipo.horometro} h
                            </TableCell>
                            <TableCell className="min-w-44 px-3 py-3 whitespace-normal">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-medium text-foreground">
                                  {ciclo.horasEnCiclo} / {ciclo.intervalo} h
                                </span>
                                <span className="font-mono text-muted-foreground">
                                  Meta: {ciclo.proximoUmbral} h
                                </span>
                              </div>
                              <Progress
                                value={ciclo.porcentajeCiclo}
                                aria-label={`Avance de ciclo para ${equipo.codigo}: ${ciclo.porcentajeCiclo}%`}
                                className={`mt-1.5 h-2 [&_[data-slot=progress-indicator]]:duration-500 [&_[data-slot=progress-indicator]]:ease-out ${
                                  equipo.requiereMantenimiento
                                    ? 'bg-alert-border/40 [&_[data-slot=progress-indicator]]:bg-destructive'
                                    : '[&_[data-slot=progress-indicator]]:bg-primary'
                                }`}
                              />
                            </TableCell>
                            <TableCell className="px-3 py-3 text-center">
                              <EstadoMantenimientoBadge
                                requiereMantenimiento={equipo.requiereMantenimiento}
                              />
                            </TableCell>
                            <TableCell className="px-3 py-3 text-xs text-muted-foreground">
                              {formatFecha(ciclo.fechaUltimoMantenimiento)}
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <RegistrarMantenimientoButton
                                  equipo={equipo}
                                  onRegisterMantenimiento={onRegisterMantenimiento}
                                />
                                <MantenimientoHistoryDialog
                                  equipo={equipo}
                                  compact
                                />
                                <EquipoEditDialog
                                  equipo={equipo}
                                  onUpdate={onUpdate}
                                  compact
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => setEquipoToDelete(equipo)}
                                  disabled={deletingId === equipo.id}
                                  aria-label={`Eliminar equipo ${equipo.codigo}`}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {equiposFiltrados.length === 0 ? (
                  <div className="col-span-full rounded-md border py-10 text-center text-sm text-muted-foreground">
                    {equipos.length === 0 ? (
                      <span>Sin datos.</span>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span>Sin resultados para los filtros aplicados.</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setFiltroEstado('TODOS');
                            setFiltroTipo('TODOS');
                            setBusqueda('');
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  equiposFiltrados.map((equipo) => {
                  const ciclo = getCicloMantenimientoInfo(equipo);
                  const animClass = getEquipoAnimationClass(
                    equipo.id,
                    recentlyCreatedId,
                    recentlyMaintainedId,
                  );
                  return (
                    <Card
                      key={equipo.id}
                      className={`justify-between gap-4 py-4 shadow-xs transition-colors ${
                        equipo.requiereMantenimiento
                          ? 'border-alert-border bg-alert-surface/30'
                          : ''
                      } ${animClass}`.trim()}
                    >
                      <CardContent className="space-y-3 px-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-base font-semibold text-foreground">
                              {equipo.codigo}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {TIPO_EQUIPO_LABEL[equipo.tipo]} · Cada{' '}
                              {INTERVALO_POR_TIPO[equipo.tipo]} h
                            </p>
                          </div>
                          <EstadoMantenimientoBadge
                            requiereMantenimiento={equipo.requiereMantenimiento}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Horómetro actual
                            </span>
                            <p className="mt-0.5 font-mono text-base font-semibold text-foreground">
                              {equipo.horometro} h
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Próximo servicio
                            </span>
                            <p className="mt-0.5 font-mono text-base font-semibold text-foreground">
                              {ciclo.proximoUmbral} h
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-medium text-foreground">
                              Ciclo: {ciclo.horasEnCiclo} / {ciclo.intervalo} h
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {ciclo.porcentajeCiclo}%
                            </span>
                          </div>
                          <Progress
                            value={ciclo.porcentajeCiclo}
                            aria-label={`Avance de ciclo para ${equipo.codigo}: ${ciclo.porcentajeCiclo}%`}
                            className={`mt-1.5 h-2 [&_[data-slot=progress-indicator]]:duration-500 [&_[data-slot=progress-indicator]]:ease-out ${
                              equipo.requiereMantenimiento
                                ? 'bg-alert-border/40 [&_[data-slot=progress-indicator]]:bg-destructive'
                                : '[&_[data-slot=progress-indicator]]:bg-primary'
                            }`}
                          />
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Último servicio: {ciclo.ultimoHorometro} h (
                            {formatFecha(ciclo.fechaUltimoMantenimiento)})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary">
                            Historial: {equipo.mantenimientos?.length ?? 0} servicios
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="flex-wrap gap-2 border-t px-4 pt-3">
                        <RegistrarMantenimientoButton
                          equipo={equipo}
                          onRegisterMantenimiento={onRegisterMantenimiento}
                        />
                        <MantenimientoHistoryDialog equipo={equipo} />
                        <EquipoEditDialog equipo={equipo} onUpdate={onUpdate} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEquipoToDelete(equipo)}
                          disabled={deletingId === equipo.id}
                          aria-label={`Eliminar equipo ${equipo.codigo}`}
                        >
                          <Trash2 aria-hidden="true" />
                          <span>{deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={equipoToDelete !== null}
        onOpenChange={(open) => {
          if (!open && deletingId === null) {
            setEquipoToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar el equipo {equipoToDelete?.codigo}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la unidad {equipoToDelete?.codigo} y todo su historial de mantenimientos registrados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingId !== null}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deletingId !== null ? 'Eliminando...' : 'Sí, eliminar equipo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
