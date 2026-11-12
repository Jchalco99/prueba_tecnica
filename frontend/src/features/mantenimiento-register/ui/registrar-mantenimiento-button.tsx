import { AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import * as React from 'react';
import {
  type Equipo,
  getCicloMantenimientoInfo,
  TIPO_EQUIPO_LABEL,
} from '@/entities/equipo/model/types';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

interface RegistrarMantenimientoButtonProps {
  equipo: Equipo;
  onRegisterMantenimiento: (equipoId: number) => Promise<void>;
}

/** Icon-only trigger that opens a confirmation modal to register preventive maintenance. */
export function RegistrarMantenimientoButton({
  equipo,
  onRegisterMantenimiento,
}: RegistrarMantenimientoButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const ciclo = getCicloMantenimientoInfo(equipo);
  const nuevoUmbral = equipo.horometro + ciclo.intervalo;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onRegisterMantenimiento(equipo.id);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el mantenimiento.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={equipo.requiereMantenimiento ? 'destructive' : 'outline'}
          size="icon-sm"
          title="Registrar Mantenimiento"
          aria-label={`Registrar Mantenimiento para ${equipo.codigo}`}
        >
          <Wrench aria-hidden="true" />
          <span className="sr-only">Registrar Mantenimiento</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${
                equipo.requiereMantenimiento
                  ? 'border-alert-border bg-alert-surface text-alert-foreground'
                  : 'border-border bg-muted text-foreground'
              }`}
            >
              <Wrench className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>¿Desea realizar el mantenimiento?</DialogTitle>
              <DialogDescription>
                Unidad <span className="font-mono font-medium">{equipo.codigo}</span> ·{' '}
                {TIPO_EQUIPO_LABEL[equipo.tipo]}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Horómetro actual</span>
            <span className="font-mono font-semibold tabular-nums">
              {equipo.horometro} h
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Último servicio</span>
            <span className="font-mono tabular-nums">{ciclo.ultimoHorometro} h</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Próximo umbral</span>
            <span className="font-mono font-semibold tabular-nums">
              {nuevoUmbral} h
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={equipo.requiereMantenimiento ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            <CheckCircle2 aria-hidden="true" />
            <span>{loading ? 'Registrando...' : 'Confirmar mantenimiento'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
