export const TipoEquipo = {
  CAMION: 'CAMION',
  EXCAVADORA: 'EXCAVADORA',
  PERFORADORA: 'PERFORADORA',
} as const;

export type TipoEquipo = (typeof TipoEquipo)[keyof typeof TipoEquipo];

export const TIPOS_EQUIPO_VALIDOS: readonly TipoEquipo[] = [
  TipoEquipo.CAMION,
  TipoEquipo.EXCAVADORA,
  TipoEquipo.PERFORADORA,
];

export const INTERVALOS_MANTENIMIENTO: Record<TipoEquipo, number> = {
  CAMION: 500,
  EXCAVADORA: 250,
  PERFORADORA: 100,
};

export function isValidTipoEquipo(value: unknown): value is TipoEquipo {
  return (
    typeof value === 'string' &&
    TIPOS_EQUIPO_VALIDOS.includes(value as TipoEquipo)
  );
}
