import { Router } from 'express';
import { AuthUseCases } from '../../application/use-cases/auth.use-cases';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const userRepository = new PrismaUserRepository();
export const authUseCases = new AuthUseCases(userRepository);
const authController = new AuthController(authUseCases);

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authMiddleware, authController.me);

export default authRouter;
