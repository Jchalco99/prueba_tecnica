import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  IUserRepository,
} from '../../domain/repositories/user.repository';
import { prisma } from '../database/prisma/prisma.client';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    return prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        role: data.role ?? 'USER',
      },
    });
  }
}
