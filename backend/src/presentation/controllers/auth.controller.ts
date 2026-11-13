import { NextFunction, Request, Response } from 'express';
import { AuthUseCases } from '../../application/use-cases/auth.use-cases';
import { getAuthenticatedUser } from '../middlewares/auth.middleware';

export class AuthController {
  constructor(private readonly authUseCases: AuthUseCases) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const resultado = await this.authUseCases.register(req.body ?? {});
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const resultado = await this.authUseCases.login(req.body ?? {});
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actor = getAuthenticatedUser(req);
      const user = await this.authUseCases.getMe(actor.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };
}
