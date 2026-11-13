import { UserEntity } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

export interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  role?: Role;
}

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}
