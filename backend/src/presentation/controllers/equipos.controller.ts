import { NextFunction, Request, Response } from 'express';
import { EquiposUseCases } from '../../application/use-cases/equipos.use-cases';

export class EquiposController {
  constructor(private readonly equiposUseCases: EquiposUseCases) {}

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipos = await this.equiposUseCases.listEquipos();
      res.status(200).json(equipos);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipo = await this.equiposUseCases.createEquipo(req.body ?? {});
      res.status(201).json(equipo);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const equipo = await this.equiposUseCases.updateEquipo(
        id,
        req.body ?? {},
      );
      res.status(200).json(equipo);
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.equiposUseCases.deleteEquipo(id);
      res.status(200).json({ message: 'Equipo eliminado correctamente.' });
    } catch (error) {
      next(error);
    }
  };

  registerMantenimiento = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipoId = Number(req.params.id);
      const resultado = await this.equiposUseCases.registerMantenimiento(
        equipoId,
        req.body ?? {},
      );
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
