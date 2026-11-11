import { EquipoEntity, MantenimientoEntity } from '../entities/equipo.entity';
import { TipoEquipo } from '../enums/tipo-equipo.enum';

export interface CreateEquipoData {
  codigo: string;
  tipo: TipoEquipo;
  horometro: number;
}

export interface UpdateEquipoData {
  codigo?: string;
  tipo?: TipoEquipo;
  horometro?: number;
}

export interface IEquipoRepository {
  findAll(): Promise<EquipoEntity[]>;
  findById(id: number): Promise<EquipoEntity | null>;
  findByCodigo(codigo: string): Promise<EquipoEntity | null>;
  create(data: CreateEquipoData): Promise<EquipoEntity>;
  update(id: number, data: UpdateEquipoData): Promise<EquipoEntity>;
  delete(id: number): Promise<void>;
  registerMantenimiento(
    equipoId: number,
    horometroActual: number,
  ): Promise<{ mantenimiento: MantenimientoEntity; equipo: EquipoEntity }>;
}
