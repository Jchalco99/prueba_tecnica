import { AlertCircle, Plus } from 'lucide-react';
import * as React from 'react';
import {
  type CreateEquipoInput,
  INTERVALO_POR_TIPO,
  TIPO_EQUIPO_LABEL,
  TIPOS_EQUIPO,
  type TipoEquipo,
} from '@/entities/equipo/model/types';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface EquipoCreateDialogProps {
  onCreate: (input: CreateEquipoInput) => Promise<void>;
  triggerLabel?: string;
}

export function EquipoCreateDialog({
  onCreate,
  triggerLabel = 'Nuevo equipo',
}: EquipoCreateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [codigo, setCodigo] = React.useState('');
  const [tipo, setTipo] = React.useState<TipoEquipo>('CAMION');
  const [horometro, setHorometro] = React.useState('0');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setCodigo('');
    setTipo('CAMION');
    setHorometro('0');
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedCodigo = codigo.trim().toUpperCase();
    if (!trimmedCodigo) {
      setError('Ingresa el código identificador del equipo (por ejemplo, CAM-101).');
      return;
    }

    const parsedHorometro = Number(horometro);
    if (horometro.trim() === '' || !Number.isInteger(parsedHorometro) || parsedHorometro < 0) {
      setError('El horómetro inicial debe ser un número entero mayor o igual a 0.');
      return;
    }

    try {
      setSubmitting(true);
      await onCreate({
        codigo: trimmedCodigo,
        tipo,
        horometro: parsedHorometro,
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el equipo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="min-h-11 sm:min-h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
          <Plus aria-hidden="true" />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Registrar nuevo equipo minero</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {error && (
            <Alert
              variant="destructive"
              className="border-alert-border bg-alert-surface text-alert-foreground"
            >
              <AlertCircle aria-hidden="true" />
              <AlertDescription className="text-alert-foreground">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="create-equipo-codigo">Código del equipo</Label>
            <Input
              id="create-equipo-codigo"
              name="codigo"
              placeholder="Ej. CAM-104"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-equipo-tipo">Tipo de maquinaria</Label>
            <Select
              value={tipo}
              onValueChange={(value) => setTipo(value as TipoEquipo)}
            >
              <SelectTrigger id="create-equipo-tipo" className="w-full">
                <SelectValue placeholder="Selecciona un tipo de equipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EQUIPO.map((item) => (
                  <SelectItem key={item} value={item}>
                    {TIPO_EQUIPO_LABEL[item]} (mantenimiento cada {INTERVALO_POR_TIPO[item]} h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-equipo-horometro">Horómetro inicial (horas)</Label>
            <Input
              id="create-equipo-horometro"
              name="horometro"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              value={horometro}
              onChange={(e) => setHorometro(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Umbral preventivo para {TIPO_EQUIPO_LABEL[tipo].toLowerCase()}:{' '}
              <span className="font-mono font-semibold text-foreground">
                {INTERVALO_POR_TIPO[tipo]} h
              </span>
              .
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {submitting ? 'Guardando...' : 'Guardar equipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
