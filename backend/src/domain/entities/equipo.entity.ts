import { TipoEquipo } from '../enums/tipo-equipo.enum';

export interface MantenimientoEntity {
  id: number;
  equipoId: number;
  fecha: Date;
  horometroActual: number;
}

export interface PropietarioResumen {
  id: number;
  nombre: string;
  email: string;
}

export interface EquipoEntity {
  id: number;
  codigo: string;
  tipo: TipoEquipo;
  horometro: number;
  userId: number;
  user?: PropietarioResumen;
  mantenimientos: MantenimientoEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipoConEstado extends EquipoEntity {
  requiereMantenimiento: boolean;
}
