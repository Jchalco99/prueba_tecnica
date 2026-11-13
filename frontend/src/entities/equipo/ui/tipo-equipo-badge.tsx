import { Drill, Pickaxe, Truck } from 'lucide-react';
import type { TipoEquipo } from '../model/types';
import { TIPO_EQUIPO_LABEL } from '../model/types';

interface TipoEquipoBadgeProps {
  tipo: TipoEquipo;
  showInterval?: boolean;
  intervalo?: number;
}

export function TipoEquipoBadge({
  tipo,
  showInterval = false,
  intervalo,
}: TipoEquipoBadgeProps) {
  let colorStyles = '';
  let Icon = Truck;

  switch (tipo) {
    case 'CAMION':
      Icon = Truck;
      colorStyles =
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
      break;
    case 'EXCAVADORA':
      Icon = Pickaxe;
      colorStyles =
        'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300';
      break;
    case 'PERFORADORA':
      Icon = Drill;
      colorStyles =
        'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors ${colorStyles}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{TIPO_EQUIPO_LABEL[tipo]}</span>
      {showInterval && intervalo !== undefined && (
        <span className="opacity-75 font-normal">· {intervalo}h</span>
      )}
    </span>
  );
}
