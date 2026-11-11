import {
  EquipoConEstado,
  MantenimientoEntity,
} from '../../domain/entities/equipo.entity';
import {
  isValidTipoEquipo,
  TIPOS_EQUIPO_VALIDOS,
} from '../../domain/enums/tipo-equipo.enum';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors/domain.error';
import {
  IEquipoRepository,
  UpdateEquipoData,
} from '../../domain/repositories/equipo.repository';
import {
  CreateEquipoDTO,
  RegisterMantenimientoDTO,
  UpdateEquipoDTO,
} from '../dtos/equipo.dto';
import { mapEquipoConEstado } from '../services/mantenimiento-calculator.service';

export class EquiposUseCases {
  constructor(private readonly equipoRepository: IEquipoRepository) {}

  async listEquipos(): Promise<EquipoConEstado[]> {
    const equipos = await this.equipoRepository.findAll();
    return equipos.map(mapEquipoConEstado);
  }

  async createEquipo(input: CreateEquipoDTO): Promise<EquipoConEstado> {
    const codigo =
      typeof input.codigo === 'string' ? input.codigo.trim() : '';

    if (!codigo) {
      throw new ValidationError('El campo "codigo" es obligatorio.');
    }

    if (!isValidTipoEquipo(input.tipo)) {
      throw new ValidationError(
        `El campo "tipo" debe ser uno de: ${TIPOS_EQUIPO_VALIDOS.join(', ')}.`,
      );
    }

    const horometro = input.horometro !== undefined ? Number(input.horometro) : 0;
    if (!Number.isInteger(horometro) || horometro < 0) {
      throw new ValidationError(
        'El campo "horometro" debe ser un número entero mayor o igual a 0.',
      );
    }

    const existente = await this.equipoRepository.findByCodigo(codigo);
    if (existente) {
      throw new ConflictError(`Ya existe un equipo con el código "${codigo}".`);
    }

    const creado = await this.equipoRepository.create({
      codigo,
      tipo: input.tipo,
      horometro,
    });

    return mapEquipoConEstado(creado);
  }

  async updateEquipo(
    id: number,
    input: UpdateEquipoDTO,
  ): Promise<EquipoConEstado> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('El ID del equipo no es válido.');
    }

    const actual = await this.equipoRepository.findById(id);
    if (!actual) {
      throw new NotFoundError(`Equipo con ID ${id} no encontrado.`);
    }

    const data: UpdateEquipoData = {};

    if (input.codigo !== undefined) {
      const codigo =
        typeof input.codigo === 'string' ? input.codigo.trim() : '';
      if (!codigo) {
        throw new ValidationError('El campo "codigo" no puede estar vacío.');
      }
      if (codigo !== actual.codigo) {
        const duplicado = await this.equipoRepository.findByCodigo(codigo);
        if (duplicado && duplicado.id !== id) {
          throw new ConflictError(
            `Ya existe otro equipo con el código "${codigo}".`,
          );
        }
      }
      data.codigo = codigo;
    }

    if (input.tipo !== undefined) {
      if (!isValidTipoEquipo(input.tipo)) {
        throw new ValidationError(
          `El campo "tipo" debe ser uno de: ${TIPOS_EQUIPO_VALIDOS.join(', ')}.`,
        );
      }
      data.tipo = input.tipo;
    }

    if (input.horometro !== undefined) {
      const horometro = Number(input.horometro);
      if (!Number.isInteger(horometro) || horometro < 0) {
        throw new ValidationError(
          'El campo "horometro" debe ser un número entero mayor o igual a 0.',
        );
      }
      data.horometro = horometro;
    }

    const actualizado = await this.equipoRepository.update(id, data);
    return mapEquipoConEstado(actualizado);
  }

  async deleteEquipo(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('El ID del equipo no es válido.');
    }

    const actual = await this.equipoRepository.findById(id);
    if (!actual) {
      throw new NotFoundError(`Equipo con ID ${id} no encontrado.`);
    }

    await this.equipoRepository.delete(id);
  }

  async registerMantenimiento(
    equipoId: number,
    input: RegisterMantenimientoDTO = {},
  ): Promise<{ mantenimiento: MantenimientoEntity; equipo: EquipoConEstado }> {
    if (!Number.isInteger(equipoId) || equipoId <= 0) {
      throw new ValidationError('El ID del equipo no es válido.');
    }

    const equipo = await this.equipoRepository.findById(equipoId);
    if (!equipo) {
      throw new NotFoundError(`Equipo con ID ${equipoId} no encontrado.`);
    }

    const horometroActual =
      input.horometroActual !== undefined
        ? Number(input.horometroActual)
        : equipo.horometro;

    if (!Number.isInteger(horometroActual) || horometroActual < 0) {
      throw new ValidationError(
        'El campo "horometroActual" debe ser un número entero mayor o igual a 0.',
      );
    }

    const resultado = await this.equipoRepository.registerMantenimiento(
      equipoId,
      horometroActual,
    );

    return {
      mantenimiento: resultado.mantenimiento,
      equipo: mapEquipoConEstado(resultado.equipo),
    };
  }
}
