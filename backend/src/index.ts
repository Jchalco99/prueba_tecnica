import { env } from './infrastructure/config/env';
import { createServer } from './presentation/server';

const app = createServer();

if (require.main === module) {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://0.0.0.0:${env.PORT}`);
  });
}

export default app;
