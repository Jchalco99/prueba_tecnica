import * as React from 'react';
import type { Equipo } from '../../../entities/equipo/model/types';
import { Button } from '../../../shared/ui/button';

interface RegistrarMantenimientoButtonProps {
  equipo: Equipo;
  onRegisterMantenimiento: (equipoId: number) => Promise<void>;
}

export function RegistrarMantenimientoButton({
  equipo,
  onRegisterMantenimiento,
}: RegistrarMantenimientoButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onRegisterMantenimiento(equipo.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={equipo.requiereMantenimiento ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-label={`Registrar Mantenimiento para ${equipo.codigo}`}
    >
      {loading ? 'Registrando...' : 'Registrar Mantenimiento'}
    </Button>
  );
}
