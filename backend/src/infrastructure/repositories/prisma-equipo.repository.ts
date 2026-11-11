import {
  EquipoEntity,
  MantenimientoEntity,
} from '../../domain/entities/equipo.entity';
import {
  CreateEquipoData,
  IEquipoRepository,
  UpdateEquipoData,
} from '../../domain/repositories/equipo.repository';
import { prisma } from '../database/prisma/prisma.client';

const includeMantenimientosOrder = {
  mantenimientos: {
    orderBy: [{ fecha: 'desc' as const }, { id: 'desc' as const }],
  },
};

export class PrismaEquipoRepository implements IEquipoRepository {
  async findAll(): Promise<EquipoEntity[]> {
    return prisma.equipo.findMany({
      include: includeMantenimientosOrder,
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number): Promise<EquipoEntity | null> {
    return prisma.equipo.findUnique({
      where: { id },
      include: includeMantenimientosOrder,
    });
  }

  async findByCodigo(codigo: string): Promise<EquipoEntity | null> {
    return prisma.equipo.findUnique({
      where: { codigo },
      include: includeMantenimientosOrder,
    });
  }

  async create(data: CreateEquipoData): Promise<EquipoEntity> {
    return prisma.equipo.create({
      data: {
        codigo: data.codigo,
        tipo: data.tipo,
        horometro: data.horometro,
      },
      include: includeMantenimientosOrder,
    });
  }

  async update(id: number, data: UpdateEquipoData): Promise<EquipoEntity> {
    return prisma.equipo.update({
      where: { id },
      data,
      include: includeMantenimientosOrder,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.equipo.delete({
      where: { id },
    });
  }

  async registerMantenimiento(
    equipoId: number,
    horometroActual: number,
  ): Promise<{ mantenimiento: MantenimientoEntity; equipo: EquipoEntity }> {
    return prisma.$transaction(async (tx) => {
      const mantenimiento = await tx.mantenimiento.create({
        data: {
          equipoId,
          horometroActual,
        },
      });

      const equipoActual = await tx.equipo.findUniqueOrThrow({
        where: { id: equipoId },
      });

      const nuevoHorometro = Math.max(equipoActual.horometro, horometroActual);

      const equipo = await tx.equipo.update({
        where: { id: equipoId },
        data: { horometro: nuevoHorometro },
        include: includeMantenimientosOrder,
      });

      return { mantenimiento, equipo };
    });
  }
}
