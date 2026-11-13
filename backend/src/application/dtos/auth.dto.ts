import { Role } from '../../domain/enums/role.enum';

export interface RegisterUserDTO {
  nombre?: unknown;
  email?: unknown;
  password?: unknown;
}

export interface LoginUserDTO {
  email?: unknown;
  password?: unknown;
}

export interface AuthActor {
  id: number;
  email: string;
  nombre: string;
  role: Role;
}
