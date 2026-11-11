export type TipoEquipo = 'CAMION' | 'EXCAVADORA' | 'PERFORADORA';

export const TIPOS_EQUIPO: readonly TipoEquipo[] = [
  'CAMION',
  'EXCAVADORA',
  'PERFORADORA',
];

export const TIPO_EQUIPO_LABEL: Record<TipoEquipo, string> = {
  CAMION: 'Camión minero',
  EXCAVADORA: 'Excavadora',
  PERFORADORA: 'Perforadora',
};

export const INTERVALO_POR_TIPO: Record<TipoEquipo, number> = {
  CAMION: 500,
  EXCAVADORA: 250,
  PERFORADORA: 100,
};

export interface Mantenimiento {
  id: number;
  equipoId: number;
  fecha: string;
  horometroActual: number;
}

export interface Equipo {
  id: number;
  codigo: string;
  tipo: TipoEquipo;
  horometro: number;
  mantenimientos: Mantenimiento[];
  requiereMantenimiento: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipoInput {
  codigo: string;
  tipo: TipoEquipo;
  horometro: number;
}

export interface UpdateEquipoInput {
  codigo?: string;
  tipo?: TipoEquipo;
  horometro?: number;
}

export interface CicloMantenimientoInfo {
  ultimoHorometro: number;
  intervalo: number;
  proximoUmbral: number;
  horasEnCiclo: number;
  horasRestantes: number;
  porcentajeCiclo: number;
  fechaUltimoMantenimiento: string | null;
}

export function getCicloMantenimientoInfo(equipo: Equipo): CicloMantenimientoInfo {
  const intervalo = INTERVALO_POR_TIPO[equipo.tipo];
  const ultimo =
    equipo.mantenimientos && equipo.mantenimientos.length > 0
      ? equipo.mantenimientos[0]
      : undefined;

  const ultimoHorometro = ultimo ? ultimo.horometroActual : 0;
  const proximoUmbral = ultimoHorometro + intervalo;
  const horasEnCiclo = Math.max(0, equipo.horometro - ultimoHorometro);
  const horasRestantes = proximoUmbral - equipo.horometro;
  const porcentajeCiclo = Math.min(
    100,
    Math.max(0, Math.round((horasEnCiclo / intervalo) * 100)),
  );

  return {
    ultimoHorometro,
    intervalo,
    proximoUmbral,
    horasEnCiclo,
    horasRestantes,
    porcentajeCiclo,
    fechaUltimoMantenimiento: ultimo ? ultimo.fecha : null,
  };
}
