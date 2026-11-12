import { Moon, Sun } from 'lucide-react';
import * as React from 'react';
import { equiposApi } from '@/entities/equipo/api/equipos.api';
import type {
  CreateEquipoInput,
  Equipo,
  UpdateEquipoInput,
} from '@/entities/equipo/model/types';
import { Button } from '@/shared/ui/button';
import { EquiposPanel } from '@/widgets/equipos-panel/ui/equipos-panel';

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
  const [feedbackKey, setFeedbackKey] = React.useState(0);
  const [recentlyCreatedId, setRecentlyCreatedId] = React.useState<number | null>(
    null,
  );
  const [recentlyMaintainedId, setRecentlyMaintainedId] = React.useState<
    number | null
  >(null);

  const showFeedback = React.useCallback(
    (next: { type: 'ok' | 'error'; text: string }) => {
      setFeedback(next);
      setFeedbackKey((prev) => prev + 1);
    },
    [],
  );

  React.useEffect(() => {
    if (recentlyCreatedId === null) {
      return undefined;
    }
    const timer = window.setTimeout(() => setRecentlyCreatedId(null), 1500);
    return () => window.clearTimeout(timer);
  }, [recentlyCreatedId]);

  React.useEffect(() => {
    if (recentlyMaintainedId === null) {
      return undefined;
    }
    const timer = window.setTimeout(() => setRecentlyMaintainedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [recentlyMaintainedId]);

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
    setRecentlyCreatedId(creado.id);
    showFeedback({
      type: 'ok',
      text: `Equipo ${creado.codigo} registrado correctamente con horómetro en ${creado.horometro} h.`,
    });
  };

  const handleUpdate = async (id: number, input: UpdateEquipoInput) => {
    const actualizado = await equiposApi.update(id, input);
    setEquipos((prev) =>
      prev.map((item) => (item.id === id ? actualizado : item)),
    );
    showFeedback({
      type: 'ok',
      text: `Equipo ${actualizado.codigo} actualizado (horómetro: ${actualizado.horometro} h).`,
    });
  };

  const handleDelete = async (equipo: Equipo) => {
    try {
      await equiposApi.remove(equipo.id);
      setEquipos((prev) => prev.filter((item) => item.id !== equipo.id));
      showFeedback({
        type: 'ok',
        text: `Equipo ${equipo.codigo} eliminado del registro.`,
      });
    } catch (err) {
      showFeedback({
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
      setRecentlyMaintainedId(equipoId);
      showFeedback({
        type: 'ok',
        text: `Mantenimiento registrado para ${resultado.equipo.codigo} a las ${resultado.mantenimiento.horometroActual} h. Ciclo preventivo reiniciado.`,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el mantenimiento.';
      showFeedback({
        type: 'error',
        text: message,
      });
      throw err;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main
        id="contenido-principal"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <EquiposPanel
          equipos={equipos}
          loading={loading}
          error={error}
          feedback={feedback}
          feedbackKey={feedbackKey}
          recentlyCreatedId={recentlyCreatedId}
          recentlyMaintainedId={recentlyMaintainedId}
          onRetry={loadEquipos}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onRegisterMantenimiento={handleRegisterMantenimiento}
        />
      </main>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onToggleDarkMode}
        aria-pressed={darkMode}
        aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="fixed right-5 bottom-5 z-40 size-10 rounded-full bg-card shadow-md"
      >
        {darkMode ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
