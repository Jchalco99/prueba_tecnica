import * as React from 'react';
import { equiposApi } from '../../../entities/equipo/api/equipos.api';
import type {
  CreateEquipoInput,
  Equipo,
  UpdateEquipoInput,
} from '../../../entities/equipo/model/types';
import { API_BASE_URL } from '../../../shared/config/env';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { EquiposPanel } from '../../../widgets/equipos-panel/ui/equipos-panel';

interface EquiposPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function EquiposPage({ darkMode, onToggleDarkMode }: EquiposPageProps) {
  const [equipos, setEquipos] = React.useState<Equipo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    type: 'ok' | 'error';
    text: string;
  } | null>(null);

  const loadEquipos = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await equiposApi.list();
      setEquipos(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo obtener la lista de equipos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    equiposApi
      .list()
      .then((data) => {
        if (active) {
          setEquipos(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo obtener la lista de equipos.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (input: CreateEquipoInput) => {
    const creado = await equiposApi.create(input);
    setEquipos((prev) => [...prev, creado]);
    setFeedback({
      type: 'ok',
      text: `Equipo ${creado.codigo} registrado correctamente con horómetro en ${creado.horometro} h.`,
    });
  };

  const handleUpdate = async (id: number, input: UpdateEquipoInput) => {
    const actualizado = await equiposApi.update(id, input);
    setEquipos((prev) =>
      prev.map((item) => (item.id === id ? actualizado : item)),
    );
    setFeedback({
      type: 'ok',
      text: `Equipo ${actualizado.codigo} actualizado (horómetro: ${actualizado.horometro} h).`,
    });
  };

  const handleDelete = async (equipo: Equipo) => {
    try {
      await equiposApi.remove(equipo.id);
      setEquipos((prev) => prev.filter((item) => item.id !== equipo.id));
      setFeedback({
        type: 'ok',
        text: `Equipo ${equipo.codigo} eliminado del registro.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo eliminar el equipo.',
      });
    }
  };

  const handleRegisterMantenimiento = async (equipoId: number) => {
    try {
      const resultado = await equiposApi.registerMantenimiento(equipoId);
      setEquipos((prev) =>
        prev.map((item) => (item.id === equipoId ? resultado.equipo : item)),
      );
      setFeedback({
        type: 'ok',
        text: `Mantenimiento registrado para ${resultado.equipo.codigo} a las ${resultado.mantenimiento.horometroActual} h. Ciclo preventivo reiniciado.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo registrar el mantenimiento.',
      });
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
              Control de Flota Minera
            </h1>
            <Badge variant="accent">API: {API_BASE_URL}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleDarkMode}
              aria-pressed={darkMode}
            >
              {darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            </Button>
          </div>
        </div>
      </header>

      <main
        id="contenido-principal"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
      >
        <EquiposPanel
          equipos={equipos}
          loading={loading}
          error={error}
          feedback={feedback}
          onRetry={loadEquipos}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onRegisterMantenimiento={handleRegisterMantenimiento}
        />
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            Sistema de registro de horómetro y mantenimiento preventivo de equipos mineros.
          </p>
          <p className="font-mono">
            Umbrales: CAMION 500 h | EXCAVADORA 250 h | PERFORADORA 100 h
          </p>
        </div>
      </footer>
    </div>
  );
}
