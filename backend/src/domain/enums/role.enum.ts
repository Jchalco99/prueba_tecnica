export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES_VALIDOS: readonly Role[] = Object.values(Role);

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES_VALIDOS.includes(value as Role);
}
