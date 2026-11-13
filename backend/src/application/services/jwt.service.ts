import jwt, { SignOptions } from 'jsonwebtoken';
import { isValidRole } from '../../domain/enums/role.enum';
import { UnauthorizedError } from '../../domain/errors/domain.error';
import { env } from '../../infrastructure/config/env';
import { AuthActor } from '../dtos/auth.dto';

interface RawJwtPayload {
  sub?: unknown;
  email?: unknown;
  nombre?: unknown;
  role?: unknown;
}

export function signAuthToken(actor: AuthActor): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      sub: actor.id,
      email: actor.email,
      nombre: actor.nombre,
      role: actor.role,
    },
    env.JWT_SECRET,
    options,
  );
}

export function verifyAuthToken(token: string): AuthActor {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as RawJwtPayload;
    const id = Number(decoded.sub);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof decoded.email !== 'string' ||
      typeof decoded.nombre !== 'string' ||
      !isValidRole(decoded.role)
    ) {
      throw new UnauthorizedError('El token de sesión no es válido.');
    }

    return {
      id,
      email: decoded.email,
      nombre: decoded.nombre,
      role: decoded.role,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    throw new UnauthorizedError(
      'Tu sesión ha expirado o el token no es válido. Inicia sesión nuevamente.',
    );
  }
}
