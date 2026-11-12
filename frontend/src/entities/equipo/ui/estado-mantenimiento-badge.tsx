import { Check, X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

interface EstadoMantenimientoBadgeProps {
  requiereMantenimiento: boolean;
}

export function EstadoMantenimientoBadge({
  requiereMantenimiento,
}: EstadoMantenimientoBadgeProps) {
  const label = requiereMantenimiento
    ? 'Requiere Mantenimiento'
    : 'En rango operativo';
  const Icon = requiereMantenimiento ? X : Check;

  return (
    <Badge
      variant={requiereMantenimiento ? 'destructive' : 'outline'}
      role="status"
      aria-label={label}
      title={label}
      className={
        requiereMantenimiento
          ? 'size-7 rounded-full border-alert-border bg-alert-surface p-0 text-alert-foreground [&>svg]:size-3.5'
          : 'size-7 rounded-full border-ok-border bg-ok-surface p-0 text-ok-foreground [&>svg]:size-3.5'
      }
    >
      <Icon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </Badge>
  );
}
