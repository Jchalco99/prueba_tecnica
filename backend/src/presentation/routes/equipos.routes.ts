import { Router } from 'express';
import { EquiposUseCases } from '../../application/use-cases/equipos.use-cases';
import { PrismaEquipoRepository } from '../../infrastructure/repositories/prisma-equipo.repository';
import { EquiposController } from '../controllers/equipos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const equipoRepository = new PrismaEquipoRepository();
const equiposUseCases = new EquiposUseCases(equipoRepository);
const equiposController = new EquiposController(equiposUseCases);

export const equiposRouter = Router();

equiposRouter.use(authMiddleware);

equiposRouter.get('/', equiposController.getAll);
equiposRouter.post('/', equiposController.create);
equiposRouter.put('/:id', equiposController.update);
equiposRouter.delete('/:id', equiposController.remove);
equiposRouter.post('/:id/mantenimientos', equiposController.registerMantenimiento);

export default equiposRouter;
