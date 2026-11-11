import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../domain/errors/domain.error';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === 'P2002'
  ) {
    res.status(409).json({ error: 'El código del equipo ya existe.' });
    return;
  }

  console.error('[UnhandledError]', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
