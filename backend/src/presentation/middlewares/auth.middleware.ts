import { NextFunction, Request, Response } from 'express';
import { AuthActor } from '../../application/dtos/auth.dto';
import { verifyAuthToken } from '../../application/services/jwt.service';
import { UnauthorizedError } from '../../domain/errors/domain.error';

declare global {
  namespace Express {
    interface Request {
      user?: AuthActor;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'Se requiere autenticación. Envía el token JWT en el encabezado Authorization.',
      );
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError('El token de autenticación está vacío.');
    }

    req.user = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUser(req: Request): AuthActor {
  if (!req.user) {
    throw new UnauthorizedError('No se encontró una sesión activa.');
  }
  return req.user;
}
