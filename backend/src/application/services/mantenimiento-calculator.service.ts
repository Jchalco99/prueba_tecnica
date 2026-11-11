import {
  EquipoConEstado,
  EquipoEntity,
} from '../../domain/entities/equipo.entity';
import { INTERVALOS_MANTENIMIENTO } from '../../domain/enums/tipo-equipo.enum';

export function calcularRequiereMantenimiento(equipo: EquipoEntity): boolean {
  const intervalo = INTERVALOS_MANTENIMIENTO[equipo.tipo];

  if (!equipo.mantenimientos || equipo.mantenimientos.length === 0) {
    return equipo.horometro >= intervalo;
  }

  const ultimoMantenimiento = [...equipo.mantenimientos].sort((a, b) => {
    const diffFecha = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    return diffFecha !== 0 ? diffFecha : b.id - a.id;
  })[0];

  const horometroUltimoMantenimiento = ultimoMantenimiento
    ? ultimoMantenimiento.horometroActual
    : 0;

  return equipo.horometro >= horometroUltimoMantenimiento + intervalo;
}

export function mapEquipoConEstado(equipo: EquipoEntity): EquipoConEstado {
  return {
    ...equipo,
    requiereMantenimiento: calcularRequiereMantenimiento(equipo),
  };
}
