export type Role = 'USER' | 'ADMIN';

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  USER: 'Operador',
};

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

export function getUserInitials(nombre: string): string {
  const parts = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'US';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
