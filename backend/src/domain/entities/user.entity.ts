import { Role } from '../enums/role.enum';

export interface UserEntity {
  id: number;
  nombre: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
