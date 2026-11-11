import cors from 'cors';
import express, { Application } from 'express';
import { healthCheck } from './controllers/health.controller';
import { errorMiddleware } from './middlewares/error.middleware';
import { equiposRouter } from './routes/equipos.routes';

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', healthCheck);
  app.use('/equipos', equiposRouter);

  app.use(errorMiddleware);

  return app;
}
