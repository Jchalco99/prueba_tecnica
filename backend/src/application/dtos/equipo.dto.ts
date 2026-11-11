import { TipoEquipo } from '../../domain/enums/tipo-equipo.enum';

export interface CreateEquipoDTO {
  codigo: string;
  tipo: TipoEquipo;
  horometro?: number;
}

export interface UpdateEquipoDTO {
  codigo?: string;
  tipo?: TipoEquipo;
  horometro?: number;
}

export interface RegisterMantenimientoDTO {
  horometroActual?: number;
}
