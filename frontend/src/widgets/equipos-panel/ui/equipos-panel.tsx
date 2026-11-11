import * as React from 'react';
import {
  type CreateEquipoInput,
  type Equipo,
  getCicloMantenimientoInfo,
  INTERVALO_POR_TIPO,
  TIPO_EQUIPO_LABEL,
  type UpdateEquipoInput,
} from '../../../entities/equipo/model/types';
import { EstadoMantenimientoBadge } from '../../../entities/equipo/ui/estado-mantenimiento-badge';
import { EquipoCreateDialog } from '../../../features/equipo-create/ui/equipo-create-dialog';
import { EquipoEditDialog } from '../../../features/equipo-edit/ui/equipo-edit-dialog';
import { RegistrarMantenimientoButton } from '../../../features/mantenimiento-register/ui/registrar-mantenimiento-button';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';

type FiltroEstado = 'TODOS' | 'ALERTA' | 'OPERATIVO';

interface EquiposPanelProps {
  equipos: Equipo[];
  loading: boolean;
  error: string | null;
  feedback: { type: 'ok' | 'error'; text: string } | null;
  onRetry: () => Promise<void>;
  onCreate: (input: CreateEquipoInput) => Promise<void>;
  onUpdate: (id: number, input: UpdateEquipoInput) => Promise<void>;
  onDelete: (equipo: Equipo) => Promise<void>;
  onRegisterMantenimiento: (equipoId: number) => Promise<void>;
}

function formatFecha(iso: string | null): string {
  if (!iso) {
    return 'Sin registros previos';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Sin registros previos';
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function EquiposPanel({
  equipos,
  loading,
  error,
  feedback,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  onRegisterMantenimiento,
}: EquiposPanelProps) {
  const [filtroEstado, setFiltroEstado] = React.useState<FiltroEstado>('TODOS');
  const [busqueda, setBusqueda] = React.useState('');
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
      if (!query) {
        return true;
      }
      return (
        equipo.codigo.toLowerCase().includes(query) ||
        TIPO_EQUIPO_LABEL[equipo.tipo].toLowerCase().includes(query) ||
        equipo.tipo.toLowerCase().includes(query)
      );
    });
  }, [equipos, filtroEstado, busqueda]);

  const handleDelete = async (equipo: Equipo) => {
    const confirmado = window.confirm(
      `¿Eliminar el equipo ${equipo.codigo} y todo su historial de mantenimientos?`,
    );
    if (!confirmado) {
      return;
    }
    try {
      setDeletingId(equipo.id);
      await onDelete(equipo);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6">
      <section
        aria-labelledby="resumen-operativo-heading"
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2
              id="resumen-operativo-heading"
              className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
            >
              Estado actual del parque de maquinaria
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Supervisa las horas acumuladas de cada unidad y registra los mantenimientos preventivos cuando superen su umbral.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button type="button" variant="outline" onClick={onRetry} disabled={loading}>
              Actualizar listado
            </Button>
            <EquipoCreateDialog onCreate={onCreate} triggerLabel="Nuevo equipo" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Unidades registradas
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-[var(--text-primary)]">
              {totalEquipos}
            </p>
          </div>
          <div
            className={`rounded-md border p-3.5 ${
              totalEnAlerta > 0
                ? 'border-[var(--alert-border)] bg-[var(--alert-bg)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-page)]'
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                totalEnAlerta > 0 ? 'text-[var(--alert-fg)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              Con mantenimiento vencido
            </p>
            <p
              className={`mt-1 font-mono text-2xl font-bold ${
                totalEnAlerta > 0 ? 'text-[var(--alert-fg)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {totalEnAlerta}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              En rango operativo
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-[var(--text-primary)]">
              {totalOperativos}
            </p>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-md border px-4 py-3 text-sm font-medium ${
            feedback.type === 'error'
              ? 'border-[var(--alert-border)] bg-[var(--alert-bg)] text-[var(--alert-fg)]'
              : 'border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-fg)]'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <section
        aria-labelledby="listado-equipos-heading"
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="listado-equipos-heading"
              className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
            >
              Bitácora de equipos y horómetros
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Intervalos preventivos: Camión 500 h, Excavadora 250 h, Perforadora 100 h.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid gap-1.5 sm:w-64">
              <Label htmlFor="buscar-equipo">Buscar por código o tipo</Label>
              <Input
                id="buscar-equipo"
                type="search"
                placeholder="Ej. CAM-01 o excavadora"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <nav
              aria-label="Filtrar equipos por estado de mantenimiento"
              className="flex flex-wrap gap-1.5"
            >
              <Button
                type="button"
                size="sm"
                variant={filtroEstado === 'TODOS' ? 'default' : 'outline'}
                onClick={() => setFiltroEstado('TODOS')}
              >
                Todos ({totalEquipos})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filtroEstado === 'ALERTA' ? 'destructive' : 'outline'}
                onClick={() => setFiltroEstado('ALERTA')}
              >
                Requieren atención ({totalEnAlerta})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filtroEstado === 'OPERATIVO' ? 'default' : 'outline'}
                onClick={() => setFiltroEstado('OPERATIVO')}
              >
                En rango ({totalOperativos})
              </Button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-page)] p-6"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Consultando registro de equipos en el servidor...
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Verificando horómetros e historial de mantenimientos.
              </p>
              <div className="mt-4 grid gap-2.5">
                <div className="h-12 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
                <div className="h-12 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
                <div className="h-12 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
              </div>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-md border border-[var(--alert-border)] bg-[var(--alert-bg)] p-6"
            >
              <h3 className="text-base font-bold text-[var(--alert-fg)]">
                No se pudo cargar el listado de equipos
              </h3>
              <p className="mt-1 text-sm text-[var(--alert-fg)]">{error}</p>
              <div className="mt-4">
                <Button type="button" variant="outline" onClick={onRetry}>
                  Reintentar conexión
                </Button>
              </div>
            </div>
          ) : equipos.length === 0 ? (
            <div className="rounded-md border border-[var(--border-control)] bg-[var(--bg-page)] p-6 text-left">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Aún no hay equipos mineros registrados
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Registra la primera unidad indicando su código, tipo de maquinaria y lectura actual del horómetro para iniciar el control de mantenimiento.
              </p>
              <div className="mt-4">
                <EquipoCreateDialog
                  onCreate={onCreate}
                  triggerLabel="Registrar primer equipo"
                />
              </div>
            </div>
          ) : equiposFiltrados.length === 0 ? (
            <div className="rounded-md border border-[var(--border-control)] bg-[var(--bg-page)] p-6 text-left">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Ningún equipo coincide con el filtro actual
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Limpia la búsqueda o cambia el filtro de estado para ver todas las unidades registradas.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFiltroEstado('TODOS');
                    setBusqueda('');
                  }}
                >
                  Mostrar todos los equipos
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto rounded-md border border-[var(--border-subtle)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Estado operativo
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Código / Unidad
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Tipo (Intervalo)
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Horómetro actual
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Ciclo hacia próximo mantenimiento
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Último mantenimiento
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {equiposFiltrados.map((equipo) => {
                      const ciclo = getCicloMantenimientoInfo(equipo);
                      return (
                        <tr
                          key={equipo.id}
                          className={
                            equipo.requiereMantenimiento
                              ? 'bg-[var(--alert-bg)]/40'
                              : 'bg-[var(--bg-surface)]'
                          }
                        >
                          <td className="px-4 py-3.5 align-middle">
                            <EstadoMantenimientoBadge
                              requiereMantenimiento={equipo.requiereMantenimiento}
                            />
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                              {equipo.codigo}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="font-medium text-[var(--text-primary)]">
                              {TIPO_EQUIPO_LABEL[equipo.tipo]}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              Cada {INTERVALO_POR_TIPO[equipo.tipo]} h
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-base font-bold text-[var(--text-primary)]">
                              {equipo.horometro} h
                            </span>
                          </td>
                          <td className="px-4 py-3.5 align-middle min-w-56">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-semibold text-[var(--text-primary)]">
                                {ciclo.horasEnCiclo} / {ciclo.intervalo} h del ciclo
                              </span>
                              <span className="font-mono text-[var(--text-secondary)]">
                                Meta: {ciclo.proximoUmbral} h
                              </span>
                            </div>
                            <div
                              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-sm border border-[var(--border-control)] bg-[var(--bg-page)]"
                              aria-hidden="true"
                            >
                              <div
                                className={`h-full ${
                                  equipo.requiereMantenimiento
                                    ? 'bg-[var(--alert-solid-bg)]'
                                    : 'bg-[var(--accent-border)]'
                                }`}
                                style={{ width: `${ciclo.porcentajeCiclo}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {equipo.requiereMantenimiento
                                ? `Excedido por ${Math.abs(ciclo.horasRestantes)} h sobre el límite (${ciclo.proximoUmbral} h)`
                                : `Restan ${ciclo.horasRestantes} h para el próximo servicio`}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 align-middle text-xs text-[var(--text-secondary)]">
                            <div className="font-mono font-semibold text-[var(--text-primary)]">
                              Base: {ciclo.ultimoHorometro} h
                            </div>
                            <div>{formatFecha(ciclo.fechaUltimoMantenimiento)}</div>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <RegistrarMantenimientoButton
                                equipo={equipo}
                                onRegisterMantenimiento={onRegisterMantenimiento}
                              />
                              <EquipoEditDialog
                                equipo={equipo}
                                onUpdate={onUpdate}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(equipo)}
                                disabled={deletingId === equipo.id}
                                aria-label={`Eliminar equipo ${equipo.codigo}`}
                              >
                                {deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {equiposFiltrados.map((equipo) => {
                  const ciclo = getCicloMantenimientoInfo(equipo);
                  return (
                    <article
                      key={equipo.id}
                      className={`flex flex-col justify-between rounded-md border p-4 ${
                        equipo.requiereMantenimiento
                          ? 'border-[var(--alert-border)] bg-[var(--alert-bg)]/30'
                          : 'border-[var(--border-control)] bg-[var(--bg-page)]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-base font-bold text-[var(--text-primary)]">
                              {equipo.codigo}
                            </span>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {TIPO_EQUIPO_LABEL[equipo.tipo]} (cada{' '}
                              {INTERVALO_POR_TIPO[equipo.tipo]} h)
                            </p>
                          </div>
                          <EstadoMantenimientoBadge
                            requiereMantenimiento={equipo.requiereMantenimiento}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs">
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              Horómetro actual
                            </span>
                            <p className="mt-0.5 font-mono text-base font-bold text-[var(--text-primary)]">
                              {equipo.horometro} h
                            </p>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              Próximo servicio
                            </span>
                            <p className="mt-0.5 font-mono text-base font-bold text-[var(--text-primary)]">
                              {ciclo.proximoUmbral} h
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-semibold text-[var(--text-primary)]">
                              Avance del ciclo: {ciclo.horasEnCiclo} / {ciclo.intervalo} h
                            </span>
                            <span className="font-mono text-[var(--text-secondary)]">
                              {ciclo.porcentajeCiclo}%
                            </span>
                          </div>
                          <div
                            className="mt-1.5 h-2.5 w-full overflow-hidden rounded-sm border border-[var(--border-control)] bg-[var(--bg-surface)]"
                            aria-hidden="true"
                          >
                            <div
                              className={`h-full ${
                                equipo.requiereMantenimiento
                                  ? 'bg-[var(--alert-solid-bg)]'
                                  : 'bg-[var(--accent-border)]'
                              }`}
                              style={{ width: `${ciclo.porcentajeCiclo}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                            Último servicio: {ciclo.ultimoHorometro} h ({formatFecha(ciclo.fechaUltimoMantenimiento)})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="neutral">
                            Historial: {equipo.mantenimientos?.length ?? 0} servicios
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
                        <RegistrarMantenimientoButton
                          equipo={equipo}
                          onRegisterMantenimiento={onRegisterMantenimiento}
                        />
                        <EquipoEditDialog equipo={equipo} onUpdate={onUpdate} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(equipo)}
                          disabled={deletingId === equipo.id}
                          aria-label={`Eliminar equipo ${equipo.codigo}`}
                        >
                          {deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
