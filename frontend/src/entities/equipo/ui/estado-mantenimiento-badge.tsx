import { Badge } from '../../../shared/ui/badge';

interface EstadoMantenimientoBadgeProps {
  requiereMantenimiento: boolean;
}

export function EstadoMantenimientoBadge({
  requiereMantenimiento,
}: EstadoMantenimientoBadgeProps) {
  if (requiereMantenimiento) {
    return (
      <Badge variant="alert" role="status">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <span>Requiere Mantenimiento</span>
      </Badge>
    );
  }

  return (
    <Badge variant="ok" role="status">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>En rango operativo</span>
    </Badge>
  );
}
