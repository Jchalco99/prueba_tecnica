import { env } from './infrastructure/config/env';
import { authUseCases } from './presentation/routes/auth.routes';
import { createServer } from './presentation/server';

const app = createServer();

if (require.main === module) {
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://0.0.0.0:${env.PORT}`);
    authUseCases
      .ensureDefaultAdmin()
      .then((admin) => {
        console.log(`Cuenta administrador verificada: ${admin.email}`);
      })
      .catch((err) => {
        console.error('No se pudo verificar la cuenta administrador inicial:', err);
      });
  });

  server.on('error', (err) => {
    console.error('Error en el servidor HTTP:', err);
  });
}

export default app;
