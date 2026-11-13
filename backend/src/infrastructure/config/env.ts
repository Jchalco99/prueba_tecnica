import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno.');
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: databaseUrl,
  JWT_SECRET: process.env.JWT_SECRET || 'minera-flota-jwt-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@minera.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador General',
};
