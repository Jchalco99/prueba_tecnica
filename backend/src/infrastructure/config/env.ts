import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno.');
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: databaseUrl,
};
