import { AlertTriangle, Check } from 'lucide-react';

interface EstadoMantenimientoBadgeProps {
  requiereMantenimiento: boolean;
  showText?: boolean;
}

export function EstadoMantenimientoBadge({
  requiereMantenimiento,
  showText = true,
}: EstadoMantenimientoBadgeProps) {
  const label = requiereMantenimiento
    ? 'Requiere Mantenimiento'
    : 'En rango operativo';

  if (!showText) {
    return (
      <span
        role="status"
        aria-label={label}
        title={label}
        className={`inline-flex size-7 items-center justify-center rounded-full border transition-colors ${
          requiereMantenimiento
            ? 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
            : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
        }`}
      >
        {requiereMantenimiento ? (
          <AlertTriangle className="size-3.5" aria-hidden="true" />
        ) : (
          <Check className="size-3.5" aria-hidden="true" />
        )}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (requiereMantenimiento) {
    return (
      <span
        role="status"
        aria-label={label}
        title={label}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors"
      >
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-rose-500"></span>
        </span>
        <span>En alerta</span>
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
    >
      <span className="size-2 shrink-0 rounded-full bg-emerald-500"></span>
      <span>Operativo</span>
    </span>
  );
}
