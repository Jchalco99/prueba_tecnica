# Etapa 1: Construcción
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json prisma7.config.ts ./
COPY prisma ./prisma
COPY src ./src

# DATABASE_URL temporal solo para que prisma7.config.ts pueda resolver durante el build
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run build

# Etapa 2: Ejecución en producción
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
