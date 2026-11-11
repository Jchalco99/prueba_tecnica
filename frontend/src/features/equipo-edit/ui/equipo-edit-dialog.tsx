import * as React from 'react';
import {
  type Equipo,
  getCicloMantenimientoInfo,
  INTERVALO_POR_TIPO,
  TIPO_EQUIPO_LABEL,
  TIPOS_EQUIPO,
  type TipoEquipo,
  type UpdateEquipoInput,
} from '../../../entities/equipo/model/types';
import { Button } from '../../../shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../shared/ui/dialog';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';

interface EquipoEditDialogProps {
  equipo: Equipo;
  onUpdate: (id: number, input: UpdateEquipoInput) => Promise<void>;
}

export function EquipoEditDialog({ equipo, onUpdate }: EquipoEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [codigo, setCodigo] = React.useState(equipo.codigo);
  const [tipo, setTipo] = React.useState<TipoEquipo>(equipo.tipo);
  const [horometro, setHorometro] = React.useState(String(equipo.horometro));
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setCodigo(equipo.codigo);
      setTipo(equipo.tipo);
      setHorometro(String(equipo.horometro));
      setError(null);
    }
  };

  const ciclo = getCicloMantenimientoInfo(equipo);

  const addHoras = (delta: number) => {
    const current = Number(horometro);
    const base = Number.isInteger(current) && current >= 0 ? current : equipo.horometro;
    setHorometro(String(base + delta));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedCodigo = codigo.trim().toUpperCase();
    if (!trimmedCodigo) {
      setError('El código del equipo no puede estar vacío.');
      return;
    }

    const parsedHorometro = Number(horometro);
    if (horometro.trim() === '' || !Number.isInteger(parsedHorometro) || parsedHorometro < 0) {
      setError('El horómetro debe ser un número entero mayor o igual a 0.');
      return;
    }

    try {
      setSubmitting(true);
      await onUpdate(equipo.id, {
        codigo: trimmedCodigo,
        tipo,
        horometro: parsedHorometro,
      });
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el equipo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar / Horómetro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar equipo {equipo.codigo}</DialogTitle>
          <DialogDescription>
            Ajusta la lectura del horómetro o modifica los datos de registro de la unidad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-md border border-[var(--alert-border)] bg-[var(--alert-bg)] px-3.5 py-2.5 text-sm font-medium text-[var(--alert-fg)]"
            >
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor={`edit-codigo-${equipo.id}`}>Código del equipo</Label>
            <Input
              id={`edit-codigo-${equipo.id}`}
              name="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`edit-tipo-${equipo.id}`}>Tipo de maquinaria</Label>
            <select
              id={`edit-tipo-${equipo.id}`}
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoEquipo)}
              className="flex min-h-11 w-full rounded-md border border-[var(--border-control)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
            >
              {TIPOS_EQUIPO.map((item) => (
                <option key={item} value={item}>
                  {TIPO_EQUIPO_LABEL[item]} (cada {INTERVALO_POR_TIPO[item]} h)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`edit-horometro-${equipo.id}`}>
              Lectura actual del horómetro (horas)
            </Label>
            <Input
              id={`edit-horometro-${equipo.id}`}
              name="horometro"
              type="number"
              min={0}
              step={1}
              value={horometro}
              onChange={(e) => setHorometro(e.target.value)}
              required
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[var(--text-secondary)]">
                Sumar horas de turno:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addHoras(50)}
              >
                +50 h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addHoras(100)}
              >
                +100 h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addHoras(250)}
              >
                +250 h
              </Button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Último mantenimiento registrado a las{' '}
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {ciclo.ultimoHorometro} h
              </span>
              . Próximo mantenimiento preventivo a las{' '}
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {ciclo.ultimoHorometro + INTERVALO_POR_TIPO[tipo]} h
              </span>
              .
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={submitting}>
              {submitting ? 'Guardando cambios...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
