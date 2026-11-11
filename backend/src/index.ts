import { env } from './infrastructure/config/env';
import { createServer } from './presentation/server';

const app = createServer();

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`);
  });
}

export default app;
